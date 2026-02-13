import { useState, useEffect, useCallback } from "react";
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
  AlertCircle,
  Plus
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
  // Productivity & Automation
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect to 6,000+ apps and automate workflows without code",
    icon: "https://zapier.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "zapier",
    features: ["Connect 6,000+ apps", "Automated workflows", "Multi-step Zaps", "VOPSy can trigger your Zaps"],
    popular: true,
  },
  {
    id: "google-workspace",
    name: "Google Workspace (Read-Only)",
    description: "Connect Gmail, Calendar, and Drive for AI agent read access",
    icon: "https://www.google.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "google",
    features: ["Gmail read access", "Calendar read access", "Drive read access"],
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
    oauthProvider: "zoom",
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
    description: "Connect your Stripe account via OAuth (Stripe Connect)",
    icon: "https://stripe.com/favicon.ico",
    category: "finance",
    status: "disconnected",
    oauthProvider: "stripe",
    features: ["Payments", "Balances", "Invoices", "Revenue analytics"],
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
    description: "Enterprise CRM platform for sales and customer management",
    icon: "https://www.salesforce.com/favicon.ico",
    category: "crm",
    status: "disconnected",
    oauthProvider: "salesforce",
    features: ["Contact management", "Sales pipeline", "Reports", "Automation"],
    popular: true,
  },
  {
    id: "zoho-crm",
    name: "Zoho CRM",
    description: "Cost-effective CRM for consultants, contractors, and small businesses",
    icon: "https://www.zoho.com/favicon.ico",
    category: "crm",
    status: "disconnected",
    oauthProvider: "zoho",
    features: ["Lead management", "Deal tracking", "Email integration", "Workflow automation"],
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Sales-focused CRM with simple pipeline management",
    icon: "https://www.pipedrive.com/favicon.ico",
    category: "crm",
    status: "disconnected",
    oauthProvider: "pipedrive",
    features: ["Visual pipeline", "Activity tracking", "Sales forecasting", "Email sync"],
  },
  
  // Additional Popular Tools
  {
    id: "calendly",
    name: "Calendly",
    description: "Automated scheduling for meetings and appointments",
    icon: "https://calendly.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "calendly",
    features: ["Meeting scheduling", "Calendar sync", "Automated reminders", "Booking pages"],
    popular: true,
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "E-commerce platform for online stores",
    icon: "https://www.shopify.com/favicon.ico",
    category: "crm",
    status: "disconnected",
    oauthProvider: "shopify",
    features: ["Order management", "Inventory tracking", "Customer data", "Sales analytics"],
    popular: true,
  },
  {
    id: "asana",
    name: "Asana",
    description: "Project management and team collaboration",
    icon: "https://asana.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "asana",
    features: ["Task management", "Project tracking", "Team collaboration", "Timeline views"],
  },
  {
    id: "notion",
    name: "Notion",
    description: "All-in-one workspace for notes, docs, and wikis",
    icon: "https://www.notion.so/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "notion",
    features: ["Documentation", "Databases", "Team wikis", "Project management"],
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Flexible database and spreadsheet hybrid",
    icon: "https://airtable.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "airtable",
    features: ["Custom databases", "Automation", "API access", "Collaboration"],
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS, voice, and communication APIs",
    icon: "https://www.twilio.com/favicon.ico",
    category: "communication",
    status: "disconnected",
    oauthProvider: "twilio",
    features: ["SMS messaging", "Voice calls", "WhatsApp", "Programmable communication"],
  },
  {
    id: "docusign",
    name: "DocuSign",
    description: "Electronic signature and document management",
    icon: "https://www.docusign.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "docusign",
    features: ["E-signatures", "Document tracking", "Templates", "Compliance"],
  },
  {
    id: "square",
    name: "Square",
    description: "Point of sale and payment processing",
    icon: "https://squareup.com/favicon.ico",
    category: "finance",
    status: "disconnected",
    oauthProvider: "square",
    features: ["Payment processing", "POS system", "Invoicing", "Inventory"],
  },
  {
    id: "trello",
    name: "Trello",
    description: "Visual project management with boards and cards",
    icon: "https://trello.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "trello",
    features: ["Kanban boards", "Task cards", "Team collaboration", "Power-Ups"],
  },
  {
    id: "monday",
    name: "Monday.com",
    description: "Work operating system for teams",
    icon: "https://monday.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "monday",
    features: ["Project tracking", "Workflow automation", "Team collaboration", "Dashboards"],
  },
  {
    id: "clickup",
    name: "ClickUp",
    description: "All-in-one productivity platform",
    icon: "https://clickup.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "clickup",
    features: ["Tasks", "Docs", "Goals", "Time tracking"],
  },
  {
    id: "intercom",
    name: "Intercom",
    description: "Customer messaging and engagement platform",
    icon: "https://www.intercom.com/favicon.ico",
    category: "communication",
    status: "disconnected",
    oauthProvider: "intercom",
    features: ["Live chat", "Customer support", "Product tours", "Email campaigns"],
  },
  {
    id: "typeform",
    name: "Typeform",
    description: "Beautiful forms and surveys",
    icon: "https://www.typeform.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "typeform",
    features: ["Forms", "Surveys", "Quizzes", "Data collection"],
  },
  {
    id: "jotform",
    name: "JotForm",
    description: "Online form builder",
    icon: "https://www.jotform.com/favicon.ico",
    category: "productivity",
    status: "disconnected",
    oauthProvider: "jotform",
    features: ["Form builder", "Payment collection", "Conditional logic", "Templates"],
  },
  {
    id: "convertkit",
    name: "ConvertKit",
    description: "Email marketing for creators",
    icon: "https://convertkit.com/favicon.ico",
    category: "marketing",
    status: "disconnected",
    oauthProvider: "convertkit",
    features: ["Email campaigns", "Landing pages", "Automation", "Subscriber management"],
  },
  {
    id: "activecampaign",
    name: "ActiveCampaign",
    description: "Customer experience automation",
    icon: "https://www.activecampaign.com/favicon.ico",
    category: "marketing",
    status: "disconnected",
    oauthProvider: "activecampaign",
    features: ["Email marketing", "Marketing automation", "CRM", "Sales automation"],
  },
  {
    id: "constantcontact",
    name: "Constant Contact",
    description: "Email and digital marketing",
    icon: "https://www.constantcontact.com/favicon.ico",
    category: "marketing",
    status: "disconnected",
    oauthProvider: "constantcontact",
    features: ["Email campaigns", "Social media", "Event marketing", "Website builder"],
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "WordPress e-commerce plugin",
    icon: "https://woocommerce.com/favicon.ico",
    category: "crm",
    status: "disconnected",
    oauthProvider: "woocommerce",
    features: ["Online store", "Product management", "Order processing", "Payment gateways"],
  },
  {
    id: "bigcommerce",
    name: "BigCommerce",
    description: "Enterprise e-commerce platform",
    icon: "https://www.bigcommerce.com/favicon.ico",
    category: "crm",
    status: "disconnected",
    oauthProvider: "bigcommerce",
    features: ["Online stores", "Multi-channel selling", "SEO tools", "Analytics"],
  },
  {
    id: "gusto",
    name: "Gusto",
    description: "Payroll, benefits, and HR",
    icon: "https://gusto.com/favicon.ico",
    category: "finance",
    status: "disconnected",
    oauthProvider: "gusto",
    features: ["Payroll processing", "Benefits administration", "Time tracking", "HR tools"],
  },
  {
    id: "freshbooks",
    name: "FreshBooks",
    description: "Accounting software for small businesses",
    icon: "https://www.freshbooks.com/favicon.ico",
    category: "finance",
    status: "disconnected",
    oauthProvider: "freshbooks",
    features: ["Invoicing", "Expense tracking", "Time tracking", "Reporting"],
  },
  {
    id: "sage",
    name: "Sage",
    description: "Business management software",
    icon: "https://www.sage.com/favicon.ico",
    category: "finance",
    status: "disconnected",
    oauthProvider: "sage",
    features: ["Accounting", "Payroll", "Payments", "Business intelligence"],
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Customer service and support platform",
    icon: "https://www.zendesk.com/favicon.ico",
    category: "communication",
    status: "disconnected",
    oauthProvider: "zendesk",
    features: ["Help desk", "Ticketing", "Live chat", "Knowledge base"],
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

  // Fetch which OAuth providers are actually configured (have app credentials)
  const { data: configuredProviders } = useQuery({
    queryKey: ["integration-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_configs")
        .select("provider, enabled")
        .eq("enabled", true);
      
      if (error) throw error;
      return (data || []).map(c => c.provider);
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
    zoom: "zoom",
    xero: "xero",
    dropbox: "dropbox",
    salesforce: "salesforce",
    zoho: "zoho-crm",
    pipedrive: "pipedrive",
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

  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  // Listen for postMessage from OAuth popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'oauth-success' && event.data?.provider) {
        const provider = event.data.provider;
        setConnectingProvider(null);
        toast.dismiss(`oauth-waiting-${provider}`);
        toast.success(`${provider} connected successfully!`);
        queryClient.invalidateQueries({ queryKey: ["integrations"] });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);

  const handleConnect = async (integration: Integration) => {
    if (integration.status === "connected") {
      toast.info(`${integration.name} is already connected`);
      return;
    }
    
    // CRITICAL: Verify user is authenticated before initiating OAuth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error("Please log in to connect integrations");
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
      "zoom": "zoom",
      "salesforce": "salesforce",
      "zoho-crm": "zoho",
      "pipedrive": "pipedrive",
    };
    
    const provider = integration.oauthProvider || providerMap[integration.id];
    if (!provider) {
      toast.info(`${integration.name} integration coming soon!`);
      return;
    }

    // Check if OAuth app is configured before attempting connection
    if (!configuredProviders?.includes(provider)) {
      toast.info(`${integration.name} is not available yet.`);
      return;
    }

    try {
      setConnectingProvider(provider);
      toast.info(`Opening ${integration.name} authorization...`);
      
      const { data, error } = await supabase.functions.invoke("oauth-start", {
        body: { provider },
      });

      // Handle response - extract error from various formats
      let body: any = data;
      if (!body && error && typeof (error as any).context?.json === "function") {
        body = await (error as any).context.json().catch(() => null);
      }

      const errorMessage = body?.error || (error instanceof Error ? error.message : null);
      
      if (errorMessage) {
        setConnectingProvider(null);
        // Handle specific error codes
        if (errorMessage.startsWith("OAUTH_APP_NOT_CONFIGURED:")) {
          console.error(`[Builder Issue] OAuth app not configured for ${provider}`);
          toast.error(`${integration.name} OAuth is not available yet. The integration requires configuration.`);
          return;
        }
        if (errorMessage.startsWith("OAUTH_APP_DISABLED:")) {
          toast.error(`${integration.name} integration is temporarily disabled.`);
          return;
        }
        throw new Error(errorMessage);
      }

      // SUCCESS: Open OAuth in NEW TAB (not replacing current page)
      if (data?.url) {
        // Open provider's OAuth page in new tab
        const oauthWindow = window.open(data.url, '_blank', 'noopener,noreferrer');
        
        if (!oauthWindow) {
          toast.error("Popup blocked. Please allow popups and try again.");
          setConnectingProvider(null);
          return;
        }

        toast.info(`Waiting for ${integration.name} authorization...`, {
          duration: 60000,
          id: `oauth-waiting-${provider}`,
        });

        // Poll for OAuth completion
        const pollInterval = setInterval(async () => {
          const { data: integrations } = await supabase
            .from("integrations")
            .select("provider")
            .eq("provider", provider)
            .maybeSingle();
          
          if (integrations) {
            clearInterval(pollInterval);
            setConnectingProvider(null);
            toast.dismiss(`oauth-waiting-${provider}`);
            toast.success(`${integration.name} connected successfully!`);
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
          }
        }, 2000);

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          if (connectingProvider === provider) {
            setConnectingProvider(null);
            toast.dismiss(`oauth-waiting-${provider}`);
          }
        }, 300000);
      } else {
        setConnectingProvider(null);
        toast.error("Failed to generate authorization URL");
      }
    } catch (err) {
      setConnectingProvider(null);
      console.error("OAuth start error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to start authorization");
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
      "dropbox": "dropbox",
      "xero": "xero",
      "zoom": "zoom",
      "salesforce": "salesforce",
      "zoho-crm": "zoho",
      "pipedrive": "pipedrive",
    };
    
    const provider = integration.oauthProvider || idToProviderMap[integration.id];
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
        
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10">
                  <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Integrations</h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Connect your favorite tools and services to streamline your workflow
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Card className="bg-card border-border">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-success/10">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{connectedCount}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Connected</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{integrations.length}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Available</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-info/10">
                    <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">Real-time</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Sync Status</p>
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
                      isConnecting={connectingProvider === (integration.oauthProvider || integration.id.replace('-workspace', '').replace('-365', ''))}
                      configuredProviders={configuredProviders || []}
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
                      isConnecting={connectingProvider === (integration.oauthProvider || integration.id.replace('-workspace', '').replace('-365', ''))}
                      configuredProviders={configuredProviders || []}
                    />
                  ))}
                </div>
              )}
              
              {/* Request Integration Card */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mt-6">
                <CardContent className="p-6 text-center">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Don't see your tool?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Request an integration and we'll add it to the platform
                  </p>
                  <Button 
                    onClick={() => {
                      // TODO: Open request integration dialog
                      toast.info("Integration request feature coming soon!");
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Integration
                  </Button>
                </CardContent>
              </Card>
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
  onDisconnect,
  isConnecting = false,
  configuredProviders = []
}: { 
  integration: Integration;
  onConnect: (i: Integration) => void;
  onDisconnect: (i: Integration) => void;
  isConnecting?: boolean;
  configuredProviders?: string[];
}) {
  const status = statusConfig[integration.status];
  const StatusIcon = status.icon;
  
  // Check if this OAuth integration is available (configured)
  const providerMap: Record<string, string> = {
    "google-workspace": "google",
    "microsoft-365": "microsoft",
    "quickbooks": "quickbooks",
    "slack": "slack",
    "hubspot": "hubspot",
    "dropbox": "dropbox",
    "xero": "xero",
    "zoom": "zoom",
    "stripe": "stripe",
  };
  const provider = integration.oauthProvider || providerMap[integration.id];
  
  // Integration is available if:
  // - It doesn't require OAuth (no oauthProvider)
  // - It's already connected
  // - It's configured in integration_configs
  const isAvailable = !provider || integration.status === "connected" || configuredProviders.includes(provider);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-card border-border hover:border-primary/30 transition-colors h-full ${isConnecting ? 'ring-2 ring-primary/50' : ''} ${!isAvailable ? 'opacity-70' : ''}`}>
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
                  {!isAvailable && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Coming Soon
                    </Badge>
                  )}
                </CardTitle>
                <div className={`flex items-center gap-1 text-xs ${isConnecting ? 'text-primary' : status.color}`}>
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Waiting for authorization...
                    </>
                  ) : (
                    <>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </>
                  )}
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
            ) : isAvailable ? (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onConnect(integration)}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                className="flex-1"
                variant="outline"
                disabled
              >
                Coming Soon
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
