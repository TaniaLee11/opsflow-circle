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
import { Settings, Eye, EyeOff, Loader2, CheckCircle2, XCircle, AlertTriangle, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    id: "stripe",
    name: "Stripe Connect",
    clientIdLabel: "Client ID (ca_...)",
    clientSecretLabel: "Secret Key (sk_...)",
    setupUrl: "https://dashboard.stripe.com/settings/connect",
    instructions: [
      "Go to Stripe Dashboard > Settings > Connect",
      "Enable Connect for your platform",
      "Copy the Client ID (starts with ca_)",
      "Go to API keys and copy your Secret Key",
      "Add redirect URI: [your-app-url]/integrations/callback",
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
  {
    id: "dropbox",
    name: "Dropbox",
    clientIdLabel: "App Key",
    clientSecretLabel: "App Secret",
    setupUrl: "https://www.dropbox.com/developers/apps",
    instructions: [
      "Go to Dropbox App Console",
      "Create a new app",
      "Choose Scoped access and Full Dropbox",
      "Add redirect URI: [your-app-url]/integrations/callback",
      "Copy App Key and App Secret",
    ],
  },
  {
    id: "xero",
    name: "Xero",
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    setupUrl: "https://developer.xero.com/app/manage",
    instructions: [
      "Go to Xero Developer Portal",
      "Create a new app (Web App)",
      "Add redirect URI: [your-app-url]/integrations/callback",
      "Copy Client ID and Client Secret",
    ],
  },
];

interface FormData {
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

interface TestResult {
  status: "idle" | "testing" | "success" | "warning" | "error";
  checks: { label: string; passed: boolean; message?: string }[];
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
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

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

  const handleTestSetup = async (providerId: string) => {
    const provider = PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return;

    setTestResults((prev) => ({
      ...prev,
      [providerId]: { status: "testing", checks: [] },
    }));

    const checks: { label: string; passed: boolean; message?: string }[] = [];
    const data = formData[providerId];
    const existingConfig = existingConfigs?.find((c) => c.provider === providerId);

    // Check 1: Client ID present
    const hasClientId = !!(data?.clientId || existingConfig?.client_id);
    checks.push({
      label: "Client ID configured",
      passed: hasClientId,
      message: hasClientId ? "Client ID is set" : "Client ID is missing",
    });

    // Check 2: Client Secret present (either in form or already saved)
    const hasSecret = !!data?.clientSecret || !!existingConfig;
    checks.push({
      label: "Client Secret configured",
      passed: hasSecret,
      message: hasSecret
        ? existingConfig
          ? "Client Secret is saved in database"
          : "Client Secret is entered (save to persist)"
        : "Client Secret is missing",
    });

    // Check 3: Integration enabled
    const isEnabled = data?.enabled ?? existingConfig?.enabled ?? true;
    checks.push({
      label: "Integration enabled",
      passed: isEnabled,
      message: isEnabled ? "Integration is enabled" : "Integration is disabled",
    });

    // Check 4: Redirect URI format
    const redirectUri = `${window.location.origin}/integrations/callback`;
    const validRedirectUri = redirectUri.startsWith("https://") || redirectUri.startsWith("http://localhost");
    checks.push({
      label: "Redirect URI format",
      passed: validRedirectUri,
      message: `Redirect URI: ${redirectUri}`,
    });

    // Check 5: Client ID format validation (provider-specific)
    let clientIdFormatValid = true;
    let clientIdMessage = "Client ID format looks correct";

    if (hasClientId && data?.clientId) {
      const clientId = data.clientId;
      if (providerId === "stripe" && !clientId.startsWith("ca_")) {
        clientIdFormatValid = false;
        clientIdMessage = "Stripe Client ID should start with 'ca_'";
      } else if (providerId === "google" && !clientId.includes(".apps.googleusercontent.com")) {
        clientIdFormatValid = false;
        clientIdMessage = "Google Client ID should end with '.apps.googleusercontent.com'";
      }
    }

    if (hasClientId) {
      checks.push({
        label: "Client ID format",
        passed: clientIdFormatValid,
        message: clientIdMessage,
      });
    }

    // Determine overall status
    const allPassed = checks.every((c) => c.passed);
    const someWarnings = checks.some((c) => !c.passed);

    await new Promise((resolve) => setTimeout(resolve, 500)); // Brief delay for UX

    setTestResults((prev) => ({
      ...prev,
      [providerId]: {
        status: allPassed ? "success" : someWarnings ? "warning" : "error",
        checks,
      },
    }));

    if (allPassed) {
      toast.success(`${provider.name} setup looks good!`);
    } else {
      toast.warning(`${provider.name} has configuration issues`);
    }
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

                      {/* Test Results */}
                      {testResults[provider.id] && testResults[provider.id].checks.length > 0 && (
                        <Alert
                          variant={
                            testResults[provider.id].status === "success"
                              ? "default"
                              : testResults[provider.id].status === "error"
                              ? "destructive"
                              : "default"
                          }
                          className={
                            testResults[provider.id].status === "success"
                              ? "border-success bg-success/10"
                              : testResults[provider.id].status === "warning"
                              ? "border-warning bg-warning/10"
                              : ""
                          }
                        >
                          {testResults[provider.id].status === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : testResults[provider.id].status === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <AlertTitle>
                            {testResults[provider.id].status === "success"
                              ? "All checks passed"
                              : testResults[provider.id].status === "warning"
                              ? "Some issues found"
                              : "Configuration issues"}
                          </AlertTitle>
                          <AlertDescription>
                            <ul className="mt-2 space-y-1 text-sm">
                              {testResults[provider.id].checks.map((check, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  {check.passed ? (
                                    <CheckCircle2 className="w-3 h-3 text-success" />
                                  ) : (
                                    <XCircle className="w-3 h-3 text-destructive" />
                                  )}
                                  <span className={check.passed ? "text-muted-foreground" : ""}>
                                    {check.label}: {check.message}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button onClick={() => handleSave(provider.id)} disabled={isSaving}>
                          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          {isConfigured ? "Update" : "Save"} Configuration
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleTestSetup(provider.id)}
                          disabled={testResults[provider.id]?.status === "testing"}
                        >
                          {testResults[provider.id]?.status === "testing" ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          Test Setup
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
