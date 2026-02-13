import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier } from "@/contexts/UserTierContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Users, TrendingUp, DollarSign, BarChart3, Plus, RefreshCw } from "lucide-react";
import { ModeLabel } from "@/components/hub/ModeLabel";

export default function Pipeline() {
  const { user } = useAuth();
  const { tier, tierConfig } = useUserTier();
  const [loading, setLoading] = useState(true);
  const [managedStatus, setManagedStatus] = useState<any>(null);
  const [pipelineSummary, setPipelineSummary] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadPipelineData();
    }
  }, [user]);

  const loadPipelineData = async () => {
    try {
      // Check if user is managed by owner's GHL
      const { data: managed } = await supabase
        .from("managed_pipeline")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      setManagedStatus(managed);

      // Load user's own integrations
      const { data: userIntegrations } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", user?.id)
        .in("provider", ["gohighlevel", "hubspot", "mailchimp", "activecampaign", "constantcontact", "klaviyo"]);

      setIntegrations(userIntegrations || []);

      // Load pipeline summary
      if (userIntegrations && userIntegrations.length > 0) {
        const { data: summary } = await supabase
          .from("pipeline_summary")
          .select("*")
          .eq("user_id", user?.id)
          .maybeSingle();

        setPipelineSummary(summary);
      }
    } catch (error) {
      console.error("Error loading pipeline data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    // TODO: Implement sync logic via edge function
    console.log("Syncing pipeline data...");
  };

  const getTierMode = () => {
    if (!tier) return { mode: "education", label: "Education" };
    
    if (["free", "ai_tax", "ai_compliance"].includes(tier)) {
      return { mode: "education", label: "Education" };
    } else if (tier === "ai_assistant") {
      return { mode: "guided", label: "Guided" };
    } else {
      return { mode: "execution", label: "Execution" };
    }
  };

  const { mode, label } = getTierMode();

  const availableProviders = [
    { id: "gohighlevel", name: "GoHighLevel", icon: "🚀", description: "All-in-one CRM, marketing automation, and pipeline management" },
    { id: "hubspot", name: "HubSpot", icon: "🧲", description: "CRM and inbound marketing platform" },
    { id: "mailchimp", name: "Mailchimp", icon: "📧", description: "Email marketing and automation" },
    { id: "activecampaign", name: "ActiveCampaign", icon: "⚡", description: "Email marketing, marketing automation, and CRM" },
    { id: "constantcontact", name: "Constant Contact", icon: "📬", description: "Email marketing and online survey tools" },
    { id: "klaviyo", name: "Klaviyo", icon: "💌", description: "Email and SMS marketing platform" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading pipeline data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pipeline & Marketing</h1>
          <p className="text-muted-foreground">Manage your sales pipeline and marketing campaigns</p>
        </div>
        <ModeLabel mode={mode} label={label} />
      </div>

      {/* Education Mode: Free/Tax/Compliance */}
      {mode === "education" && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h2 className="text-2xl font-bold mb-4">📚 Learn About Pipeline Management</h2>
          <p className="mb-4">
            A sales pipeline helps you track prospects from first contact to closed deal. Marketing automation keeps your leads engaged with targeted campaigns.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What You'll Get with Assistant Tier ($39.99/mo):</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Connect your own CRM (GoHighLevel, HubSpot, Mailchimp, etc.)</li>
                <li>View real-time pipeline metrics and campaign performance</li>
                <li>VOPSy analyzes your data and tells you what to do next</li>
                <li>Get recommendations on which leads to follow up with</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What You'll Get with Operations Tier ($99.99/mo):</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Everything in Assistant tier PLUS automation</li>
                <li>VOPSy automatically sends follow-up emails</li>
                <li>Auto-tag leads based on behavior</li>
                <li>Automated campaign triggers and sequences</li>
              </ul>
            </div>
            <Button className="mt-4">Upgrade to Assistant Tier</Button>
          </div>
        </Card>
      )}

      {/* Managed by Owner's GHL */}
      {managedStatus && managedStatus.status === "active" && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">✅ Managed Pipeline Active</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your pipeline is currently managed through our GoHighLevel system. You're receiving automated follow-ups and campaign management.
              </p>
              <Badge variant="outline" className="bg-green-100">Managed by Virtual OPS</Badge>
            </div>
            <Button variant="outline" size="sm">
              Connect Your Own Tool
            </Button>
          </div>
        </Card>
      )}

      {/* Pipeline Summary Metrics */}
      {mode !== "education" && pipelineSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold">{pipelineSummary.total_contacts}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold">{pipelineSummary.total_deals}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent (30d)</p>
                <p className="text-2xl font-bold">{pipelineSummary.emails_sent_30d}</p>
              </div>
              <Mail className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (30d)</p>
                <p className="text-2xl font-bold">${pipelineSummary.revenue_30d}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Connected Integrations */}
      {mode !== "education" && integrations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Connected Tools</h3>
            <Button onClick={handleSync} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Data
            </Button>
          </div>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-100">Connected</Badge>
                  <span className="font-medium">{integration.provider}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Last synced: {new Date(integration.updated_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Available Integrations */}
      {mode !== "education" && integrations.length === 0 && !managedStatus && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Connect Your Pipeline Tool</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProviders.map((provider) => (
              <Card key={provider.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{provider.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{provider.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{provider.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* VOPSy Insights */}
      {mode === "guided" && pipelineSummary && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <h3 className="text-lg font-semibold mb-3">🤖 VOPSy Insights</h3>
          <div className="space-y-2 text-sm">
            <p>• You have {pipelineSummary.total_contacts} contacts. Focus on the 20% that generate 80% of your revenue.</p>
            <p>• Your email open rate is {((pipelineSummary.emails_opened_30d / pipelineSummary.emails_sent_30d) * 100).toFixed(1)}%. Industry average is 21%.</p>
            <p>• Follow up with leads who opened your last email but didn't click - they're interested but need a nudge.</p>
          </div>
        </Card>
      )}

      {/* VOPSy Automation Status */}
      {mode === "execution" && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
          <h3 className="text-lg font-semibold mb-3">⚡ VOPSy Automation Active</h3>
          <div className="space-y-2 text-sm">
            <p>✅ Automatically sending follow-up emails to warm leads</p>
            <p>✅ Tagging contacts based on engagement level</p>
            <p>✅ Triggering campaigns when leads reach specific milestones</p>
            <p>✅ Monitoring pipeline health and alerting you to issues</p>
          </div>
        </Card>
      )}
    </div>
  );
}
