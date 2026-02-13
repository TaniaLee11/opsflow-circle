import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Workflow, Plus, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, DollarSign, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GHLOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  contactId: string;
  monetaryValue: number;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
}

interface PipelineData {
  opportunities: GHLOpportunity[];
  contacts: GHLContact[];
  setupRequired: boolean;
  setupInstructions?: {
    step1: string;
    step2: string;
    step3: string;
  };
  syncedAt?: string;
}

export default function Pipeline() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('ghl-sync-pipeline');
      
      if (error) {
        console.error('Error fetching pipeline data:', error);
        setPipelineData({
          opportunities: [],
          contacts: [],
          setupRequired: true,
        });
      } else {
        setPipelineData(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setPipelineData({
        opportunities: [],
        contacts: [],
        setupRequired: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await fetchPipelineData();
    } finally {
      setSyncing(false);
    }
  };

  const totalValue = pipelineData?.opportunities.reduce((sum, opp) => sum + (opp.monetaryValue || 0), 0) || 0;
  const activeDeals = pipelineData?.opportunities.filter(opp => opp.status === 'open').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className={cn(
        "min-h-screen transition-all duration-300",
        isMobile ? "pt-14" : "md:ml-64"
      )}>
        <header className="sticky top-0 lg:top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
                  <Workflow className="w-6 h-6" />
                  Pipeline Management
                </h1>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs sm:text-sm text-muted-foreground mt-0.5"
              >
                Powered by GoHighLevel CRM
              </motion.p>
            </div>

            {!pipelineData?.setupRequired && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <button 
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                  Sync Pipeline
                </button>
              </motion.div>
            )}
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <RefreshCw className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading pipeline...</p>
              </div>
            ) : pipelineData?.setupRequired ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-lg p-8"
              >
                <div className="max-w-2xl mx-auto text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Workflow className="w-10 h-10 text-primary" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3">GoHighLevel Integration Setup Required</h2>
                  <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                    Complete the Private Integration setup in GoHighLevel to sync your pipeline data with Virtual OPS Hub.
                  </p>

                  {pipelineData.setupInstructions && (
                    <div className="bg-muted/50 rounded-lg p-6 mb-6 text-left">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        Setup Instructions
                      </h3>
                      <ol className="space-y-3 text-sm">
                        <li className="flex gap-3">
                          <span className="font-bold text-primary">1.</span>
                          <span>{pipelineData.setupInstructions.step1}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-primary">2.</span>
                          <span>{pipelineData.setupInstructions.step2}</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-primary">3.</span>
                          <span>{pipelineData.setupInstructions.step3}</span>
                        </li>
                      </ol>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <CheckCircle2 className="w-6 h-6 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">Pipeline Sync</h3>
                      <p className="text-sm text-muted-foreground">
                        View and manage all your deals in one place
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <CheckCircle2 className="w-6 h-6 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">Contact Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Access customer data and communication history
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <CheckCircle2 className="w-6 h-6 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">AI Automation</h3>
                      <p className="text-sm text-muted-foreground">
                        Let VOPSy automate follow-ups and workflows
                      </p>
                    </div>
                  </div>

                  <a 
                    href="https://app.gohighlevel.com/v2/location/xVT2gzHtEAYCuwmWgAbG/settings/private-integrations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                  >
                    Open GoHighLevel Settings
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <p className="text-xs text-muted-foreground mt-4">
                    After completing setup, refresh this page to sync your pipeline
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Active Deals</h3>
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-3xl font-bold">{activeDeals}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pipelineData?.opportunities.length || 0} total opportunities
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Pipeline Value</h3>
                      <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total opportunity value
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Contacts</h3>
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold">{pipelineData?.contacts.length || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Synced from GoHighLevel
                    </p>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">GoHighLevel Connected</h3>
                        <p className="text-sm text-muted-foreground">
                          Last synced: {pipelineData?.syncedAt ? new Date(pipelineData.syncedAt).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleSync}
                      disabled={syncing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                      Sync Now
                    </button>
                  </div>
                </div>

                {/* Opportunities List */}
                {pipelineData?.opportunities && pipelineData.opportunities.length > 0 ? (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                      <h2 className="text-lg font-semibold">Opportunities</h2>
                    </div>
                    <div className="divide-y divide-border">
                      {pipelineData.opportunities.map((opp) => {
                        const contact = pipelineData.contacts.find(c => c.id === opp.contactId);
                        return (
                          <div key={opp.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{opp.name}</h3>
                                {contact && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {contact.firstName} {contact.lastName}
                                    {contact.companyName && ` • ${contact.companyName}`}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <span className={cn(
                                      "w-2 h-2 rounded-full",
                                      opp.status === 'open' ? "bg-green-500" : "bg-gray-400"
                                    )} />
                                    {opp.status}
                                  </span>
                                  <span>Updated: {new Date(opp.updatedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">
                                  ${opp.monetaryValue?.toLocaleString() || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <Workflow className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-bold mb-2">No Opportunities Found</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your pipeline is empty. Create opportunities in GoHighLevel to see them here.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
