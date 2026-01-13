import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Link2, 
  Check, 
  ExternalLink, 
  Search,
  Zap,
  RefreshCw,
  Settings,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "productivity" | "finance" | "communication" | "storage" | "marketing" | "crm";
  status: "connected" | "disconnected";
  features: string[];
  popular?: boolean;
  connectedAccount?: string;
  lastSynced?: string;
  health?: string;
  oauthProvider?: string;
}

const integrations: Integration[] = [
  // Productivity
  {
    id: "google-workspace",
    name: "Google Workspace",
    description: "Connect Gmail, Calendar, Drive, and Docs for seamless productivity",
    icon: "https://www.google.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "google",
    features: ["Gmail sync", "Calendar integration", "Drive storage", "Docs collaboration"],
    popular: true,
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    description: "Integrate Outlook, Teams, OneDrive, and Office apps",
    icon: "https://www.microsoft.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "microsoft",
    features: ["Outlook email", "Teams messaging", "OneDrive storage", "Office apps"],
    popular: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team communication and collaboration platform",
    icon: "https://slack.com/favicon.ico",
    category: "communication",
    status: "disconnected",
    oauthProvider: "slack",
    features: ["Channel notifications", "Direct messages", "File sharing", "Workflow automation"],
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Video conferencing and virtual meetings",
    icon: "https://zoom.us/favicon.ico",
    category: "communication",
    status: "disconnected",
    features: ["Meeting scheduling", "Recording sync", "Attendance tracking", "Calendar sync"],
  },
  
  // Finance & Accounting
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Accounting software for invoicing, expenses, and financial reports",
    icon: "https://quickbooks.intuit.com/favicon.ico",
    category: "finance",
    status: "disconnected",
    oauthProvider: "quickbooks",
    features: ["Invoice sync", "Expense tracking", "Financial reports", "Tax preparation"],
    popular: true,
  },
  {
    id: "wave",
    name: "Wave Accounting",
    description: "Free accounting and invoicing for small businesses",
    icon: "https://www.waveapps.com/favicon.ico",
    category: "finance",
    status: "disconnected",
    features: ["Invoicing", "Receipt scanning", "Financial reports", "Payroll integration"],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Connect your Stripe account for payment processing",
    icon: "https://stripe.com/favicon.ico",
    category: "finance",
    status: "disconnected",
    oauthProvider: "stripe",
    features: ["Payment processing", "Subscription billing", "Invoice management", "Revenue analytics"],
    popular: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Online payments and money transfers",
    icon: "https://www.paypal.com/favicon.ico",
    category: "finance",
    status: "disconnected",
    features: ["Payment processing", "Invoicing", "Money transfers", "Buyer protection"],
  },
  {
    id: "xero",
    name: "Xero",
    description: "Cloud-based accounting software for small businesses",
    icon: "https://www.xero.com/favicon.ico",
    category: "finance",
    status: "disconnected",
    oauthProvider: "xero",
    features: ["Bank reconciliation", "Invoicing", "Expense claims", "Multi-currency"],
  },
  
  // Storage & Documents
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Cloud storage and file synchronization",
    icon: "https://www.dropbox.com/favicon.ico",
    category: "storage",
    status: "disconnected",
    oauthProvider: "dropbox",
    features: ["File sync", "Sharing", "Version history", "Team folders"],
  },
  {
    id: "box",
    name: "Box",
    description: "Enterprise content management and file sharing",
    icon: "https://www.box.com/favicon.ico",
    category: "storage",
    status: "disconnected",
    features: ["Secure storage", "Collaboration", "Workflow automation", "Compliance"],
  },
  
  // Marketing
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Email marketing and automation platform",
    icon: "https://mailchimp.com/favicon.ico",
    category: "marketing",
    status: "disconnected",
    features: ["Email campaigns", "Audience management", "Analytics", "Automation"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM, marketing, sales, and service software",
    icon: "https://www.hubspot.com/favicon.ico",
    category: "crm",
    status: "disconnected",
    oauthProvider: "hubspot",
    features: ["CRM", "Email marketing", "Lead tracking", "Analytics"],
    popular: true,
  },
  
  // CRM
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Customer relationship management platform",
    icon: "https://www.salesforce.com/favicon.ico",
    category: "crm",
    status: "disconnected",
    features: ["Contact management", "Sales pipeline", "Reports", "Automation"],
  },
];

const categoryLabels: Record<string, string> = {
  productivity: "Productivity",
  finance: "Finance & Accounting",
  communication: "Communication",
  storage: "Storage & Documents",
  marketing: "Marketing",
  crm: "CRM & Sales",
};

const statusConfig = {
  connected: { label: "Connected", icon: CheckCircle2, color: "text-success" },
  disconnected: { label: "Not Connected", icon: AlertCircle, color: "text-muted-foreground" },
};

export default function Integrations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const queryClient = useQueryClient();
  
  // Fetch real integration statuses from database
  const { data: connectedIntegrations, isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("provider, connected_account, health, last_synced_at");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Map provider names to integration IDs
  const providerToIdMap: Record<string, string> = {
    google: "google-workspace",
    microsoft: "microsoft-365",
    quickbooks: "quickbooks",
    slack: "slack",
    hubspot: "hubspot",
    stripe: "stripe",
  };

  // Update integration statuses based on database
  const integrationsWithRealStatus = integrations.map((integration) => {
    const connected = connectedIntegrations?.find(
      (c) => providerToIdMap[c.provider] === integration.id
    );
    
    if (connected) {
      return {
        ...integration,
        status: "connected" as const,
        connectedAccount: connected.connected_account || undefined,
        lastSynced: connected.last_synced_at || undefined,
        health: connected.health || undefined,
      };
    }
    
    return { ...integration, status: "disconnected" as const };
  });

  const categories = ["all", ...Object.keys(categoryLabels)];
  
  const filteredIntegrations = integrationsWithRealStatus.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || integration.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrationsWithRealStatus.filter(i => i.status === "connected").length;
  const popularIntegrations = integrationsWithRealStatus.filter(i => i.popular);

  const handleConnect = async (integration: Integration) => {
    if (integration.status === "connected") {
      toast.info(`${integration.name} is already connected`);
      return;
    }
    
    // Map integration IDs to provider names
    const providerMap: Record<string, string> = {
      "google-workspace": "google",
      "microsoft-365": "microsoft",
      "quickbooks": "quickbooks",
      "slack": "slack",
      "hubspot": "hubspot",
      "stripe": "stripe",
      "dropbox": "dropbox",
      "xero": "xero",
    };
    
    const provider = integration.oauthProvider || providerMap[integration.id];
    if (!provider) {
      toast.info(`${integration.name} integration coming soon!`);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("oauth-start", {
        body: { provider },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to start authorization");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect");
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    // Map integration IDs to provider names
    const idToProviderMap: Record<string, string> = {
      "google-workspace": "google",
      "microsoft-365": "microsoft",
      "quickbooks": "quickbooks",
      "slack": "slack",
      "hubspot": "hubspot",
      "stripe": "stripe",
    };
    
    const provider = idToProviderMap[integration.id];
    if (!provider) {
      toast.error("Unknown integration");
      return;
    }

    try {
      const { error } = await supabase
        .from("integrations")
        .delete()
        .eq("provider", provider);
      
      if (error) throw error;
      
      toast.success(`Disconnected from ${integration.name}`);
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to disconnect");
    }
  };

  return (
    <AccessGate>
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        
        <main className="flex-1 ml-64 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Link2 className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
              </div>
              <p className="text-muted-foreground">
                Connect your favorite tools and services to streamline your workflow
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{connectedCount}</p>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{integrations.length}</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-info/10">
                    <RefreshCw className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">Real-time</p>
                    <p className="text-sm text-muted-foreground">Sync Status</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
              <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
                <TabsTrigger value="all" className="data-[state=active]:bg-card">
                  All
                </TabsTrigger>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <TabsTrigger key={key} value={key} className="data-[state=active]:bg-card">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Popular Integrations */}
            {activeCategory === "all" && !searchQuery && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Popular Integrations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularIntegrations.map((integration) => (
                    <IntegrationCard 
                      key={integration.id} 
                      integration={integration}
                      onConnect={handleConnect}
                      onDisconnect={handleDisconnect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Integrations */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {activeCategory === "all" ? "All Integrations" : categoryLabels[activeCategory]}
              </h2>
              {filteredIntegrations.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No integrations found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIntegrations.map((integration) => (
                    <IntegrationCard 
                      key={integration.id} 
                      integration={integration}
                      onConnect={handleConnect}
                      onDisconnect={handleDisconnect}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </AccessGate>
  );
}

function IntegrationCard({ 
  integration, 
  onConnect, 
  onDisconnect 
}: { 
  integration: Integration;
  onConnect: (i: Integration) => void;
  onDisconnect: (i: Integration) => void;
}) {
  const status = statusConfig[integration.status];
  const StatusIcon = status.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-card border-border hover:border-primary/30 transition-colors h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                <img 
                  src={integration.icon} 
                  alt={integration.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    // Create fallback span
                    const fallback = document.createElement("span");
                    fallback.className = "text-xl font-bold text-muted-foreground";
                    fallback.textContent = integration.name[0];
                    target.parentElement?.appendChild(fallback);
                  }}
                />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {integration.name}
                  {integration.popular && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Popular
                    </Badge>
                  )}
                </CardTitle>
                <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-sm line-clamp-2">
            {integration.description}
          </CardDescription>
          
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 3).map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px] font-normal">
                {feature}
              </Badge>
            ))}
            {integration.features.length > 3 && (
              <Badge variant="outline" className="text-[10px] font-normal">
                +{integration.features.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2 pt-2">
            {integration.status === "connected" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onDisconnect(integration)}
                >
                  Disconnect
                </Button>
                <Button variant="ghost" size="sm" className="px-2">
                  <Settings className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onConnect(integration)}
              >
                <Link2 className="w-4 h-4 mr-2" />
                Connect
              </Button>
            )}

            <Button variant="ghost" size="sm" className="px-2">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
