import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings, Eye, EyeOff, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProviderConfig {
  id: string;
  name: string;
  clientIdLabel: string;
  clientSecretLabel: string;
  setupUrl: string;
  instructions: string[];
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "google",
    name: "Google Workspace",
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    setupUrl: "https://console.cloud.google.com/apis/credentials",
    instructions: [
      "Go to Google Cloud Console",
      "Create or select a project",
      "Navigate to APIs & Services > Credentials",
      "Create OAuth 2.0 Client ID (Web application type)",
      "Add authorized redirect URI: [your-app-url]/integrations/callback",
      "Copy the Client ID and Client Secret",
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft 365",
    clientIdLabel: "Application (client) ID",
    clientSecretLabel: "Client Secret Value",
    setupUrl: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade",
    instructions: [
      "Go to Azure Portal > App registrations",
      "Create a new registration",
      "Add redirect URI: [your-app-url]/integrations/callback",
      "Under Certificates & secrets, create a new client secret",
      "Copy the Application (client) ID and secret value",
    ],
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    setupUrl: "https://developer.intuit.com/app/developer/qbo/docs/get-started",
    instructions: [
      "Go to Intuit Developer Portal",
      "Create an app",
      "Add redirect URI in OAuth settings",
      "Copy Client ID and Client Secret from Keys & credentials",
    ],
  },
  {
    id: "slack",
    name: "Slack",
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    setupUrl: "https://api.slack.com/apps",
    instructions: [
      "Go to Slack API > Your Apps",
      "Create new app (From scratch)",
      "Add redirect URL in OAuth & Permissions",
      "Copy Client ID and Client Secret from Basic Information",
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    setupUrl: "https://developers.hubspot.com/docs/api/creating-an-app",
    instructions: [
      "Go to HubSpot Developer Account",
      "Create a new app",
      "Add redirect URI in Auth settings",
      "Copy Client ID and Client Secret from Auth tab",
    ],
  },
];

interface FormData {
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

export function IntegrationSettingsDialog() {
  const { isOwner, currentTier } = useAuth();
  const isEffectiveOwner = isOwner || currentTier === "owner";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState("google");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, FormData>>({});

  // Fetch existing configs
  const { data: existingConfigs, isLoading } = useQuery({
    queryKey: ["integration-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_configs")
        .select("provider, client_id, enabled");
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && isEffectiveOwner,
  });

  // Initialize form data from existing configs
  useEffect(() => {
    if (existingConfigs) {
      const newFormData: Record<string, FormData> = {};
      PROVIDERS.forEach((provider) => {
        const existing = existingConfigs.find((c) => c.provider === provider.id);
        newFormData[provider.id] = {
          clientId: existing?.client_id || "",
          clientSecret: "", // Never returned from DB for security
          enabled: existing?.enabled ?? true,
        };
      });
      setFormData(newFormData);
    }
  }, [existingConfigs]);

  const handleSave = async (providerId: string) => {
    const data = formData[providerId];
    if (!data?.clientId) {
      toast.error("Client ID is required");
      return;
    }

    setIsSaving(true);
    try {
      const existing = existingConfigs?.find((c) => c.provider === providerId);
      
      const upsertData: any = {
        provider: providerId,
        client_id: data.clientId,
        enabled: data.enabled,
      };

      // Only update secret if provided (not empty)
      if (data.clientSecret) {
        upsertData.client_secret = data.clientSecret;
      } else if (!existing) {
        // New record requires secret
        toast.error("Client Secret is required for new integrations");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from("integration_configs")
        .upsert(upsertData, { onConflict: "provider" });

      if (error) throw error;

      toast.success(`${PROVIDERS.find((p) => p.id === providerId)?.name} configuration saved`);
      queryClient.invalidateQueries({ queryKey: ["integration-configs"] });
      
      // Clear the secret from form (it's saved)
      setFormData((prev) => ({
        ...prev,
        [providerId]: { ...prev[providerId], clientSecret: "" },
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (providerId: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("integration_configs")
        .delete()
        .eq("provider", providerId);

      if (error) throw error;

      toast.success("Configuration removed");
      queryClient.invalidateQueries({ queryKey: ["integration-configs"] });
      
      setFormData((prev) => ({
        ...prev,
        [providerId]: { clientId: "", clientSecret: "", enabled: true },
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEffectiveOwner) return null;

  const getConfigStatus = (providerId: string) => {
    const config = existingConfigs?.find((c) => c.provider === providerId);
    if (!config) return "not-configured";
    return config.enabled ? "active" : "disabled";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Configure Integrations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Integration Settings</DialogTitle>
          <DialogDescription>
            Configure OAuth credentials for third-party integrations. These settings allow your users to connect their accounts.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeProvider} onValueChange={setActiveProvider}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {PROVIDERS.map((provider) => {
                const status = getConfigStatus(provider.id);
                return (
                  <TabsTrigger
                    key={provider.id}
                    value={provider.id}
                    className="relative data-[state=active]:bg-card"
                  >
                    {provider.name}
                    <span
                      className={`ml-2 w-2 h-2 rounded-full ${
                        status === "active"
                          ? "bg-success"
                          : status === "disabled"
                          ? "bg-warning"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {PROVIDERS.map((provider) => {
              const data = formData[provider.id] || { clientId: "", clientSecret: "", enabled: true };
              const isConfigured = !!existingConfigs?.find((c) => c.provider === provider.id);

              return (
                <TabsContent key={provider.id} value={provider.id} className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription>
                        <a
                          href={provider.setupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Open {provider.name} Developer Console →
                        </a>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Setup Instructions */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Setup Instructions:</p>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                          {provider.instructions.map((instruction, idx) => (
                            <li key={idx}>{instruction}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Form Fields */}
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`${provider.id}-client-id`}>{provider.clientIdLabel}</Label>
                          <Input
                            id={`${provider.id}-client-id`}
                            value={data.clientId}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [provider.id]: { ...prev[provider.id], clientId: e.target.value },
                              }))
                            }
                            placeholder={`Enter ${provider.clientIdLabel}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${provider.id}-client-secret`}>
                            {provider.clientSecretLabel}
                            {isConfigured && (
                              <span className="text-muted-foreground ml-2">(leave blank to keep existing)</span>
                            )}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`${provider.id}-client-secret`}
                              type={showSecrets[provider.id] ? "text" : "password"}
                              value={data.clientSecret}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [provider.id]: { ...prev[provider.id], clientSecret: e.target.value },
                                }))
                              }
                              placeholder={isConfigured ? "••••••••••••" : `Enter ${provider.clientSecretLabel}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                              onClick={() =>
                                setShowSecrets((prev) => ({
                                  ...prev,
                                  [provider.id]: !prev[provider.id],
                                }))
                              }
                            >
                              {showSecrets[provider.id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`${provider.id}-enabled`}
                              checked={data.enabled}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [provider.id]: { ...prev[provider.id], enabled: checked },
                                }))
                              }
                            />
                            <Label htmlFor={`${provider.id}-enabled`}>Enable integration</Label>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button onClick={() => handleSave(provider.id)} disabled={isSaving}>
                          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          {isConfigured ? "Update" : "Save"} Configuration
                        </Button>
                        {isConfigured && (
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(provider.id)}
                            disabled={isSaving}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
