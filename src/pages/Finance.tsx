import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, AlertCircle, RefreshCw, Link as LinkIcon } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FinancialSummary {
  total_revenue_30d: number;
  total_revenue_90d: number;
  total_revenue_ytd: number;
  outstanding_invoices: number;
  overdue_invoices: number;
  overdue_amount: number;
  recent_charges: any[];
  monthly_trend: any[];
  cash_flow_status: string;
  payout_schedule: any;
  last_synced: string;
  sync_status: string;
}

interface PlatformMetrics {
  mrr: number;
  total_subscribers: number;
  subscribers_by_tier: Record<string, number>;
  new_signups_week: number;
  churn_rate: number;
  arpu: number;
  revenue_by_tier: Record<string, number>;
}

export default function Finance() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  const isOwner = profile?.email === "tania@virtualopsassist.com";
  const hasFinanceAccess = profile?.selected_tier && !["free", "ai_tax", "ai_compliance"].includes(profile.selected_tier);

  useEffect(() => {
    if (!profileLoading && profile) {
      // Check tier access
      if (!hasFinanceAccess) {
        toast.error("Finance Intelligence is available on AI Assistant and above");
        navigate("/hub");
        return;
      }

      loadFinancialData();
    }
  }, [profile, profileLoading]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      // Check if Stripe is connected
      const { data: integration } = await supabase
        .from("integrations")
        .select("status")
        .eq("provider", "stripe")
        .eq("status", "active")
        .single();

      setStripeConnected(!!integration);

      if (integration) {
        // Load financial summary
        const { data: summary } = await supabase
          .from("user_financial_summary")
          .select("*")
          .single();

        if (summary) {
          setFinancialSummary(summary);
        }
      }

      // Load platform metrics if owner
      if (isOwner) {
        const { data: metrics } = await supabase
          .from("platform_metrics")
          .select("*")
          .order("date", { ascending: false })
          .limit(1)
          .single();

        if (metrics) {
          setPlatformMetrics(metrics);
        }
      }
    } catch (error) {
      console.error("Error loading financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncStripeData = async () => {
    try {
      setSyncing(true);
      const { data, error } = await supabase.functions.invoke("stripe-connect-sync");

      if (error) throw error;

      toast.success("Financial data synced successfully");
      await loadFinancialData();
    } catch (error: any) {
      console.error("Sync error:", error);
      toast.error(error.message || "Failed to sync financial data");
    } finally {
      setSyncing(false);
    }
  };

  const syncPlatformMetrics = async () => {
    try {
      setSyncing(true);
      const { data, error } = await supabase.functions.invoke("platform-metrics-sync");

      if (error) throw error;

      toast.success("Platform metrics synced successfully");
      await loadFinancialData();
    } catch (error: any) {
      console.error("Sync error:", error);
      toast.error(error.message || "Failed to sync platform metrics");
    } finally {
      setSyncing(false);
    }
  };

  const connectStripe = () => {
    navigate("/integrations");
  };

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasFinanceAccess) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Intelligence</h1>
          <p className="text-muted-foreground">Real-time financial insights and analytics</p>
        </div>
        {stripeConnected && (
          <Button onClick={syncStripeData} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            Sync Data
          </Button>
        )}
      </div>

      {!stripeConnected && (
        <Alert>
          <LinkIcon className="w-4 h-4" />
          <AlertDescription>
            Connect your Stripe account to see real-time financial data and insights.
            <Button onClick={connectStripe} variant="link" className="ml-2">
              Connect Stripe
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {stripeConnected && financialSummary && (
        <>
          {/* Financial Health Score */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Health</CardTitle>
              <CardDescription>Overall financial status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge 
                  variant={
                    financialSummary.cash_flow_status === "healthy" ? "default" :
                    financialSummary.cash_flow_status === "warning" ? "secondary" : "destructive"
                  }
                  className="text-lg px-4 py-2"
                >
                  {financialSummary.cash_flow_status.toUpperCase()}
                </Badge>
                {financialSummary.overdue_invoices > 0 && (
                  <Alert variant="destructive" className="flex-1">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      {financialSummary.overdue_invoices} overdue invoice(s) totaling ${financialSummary.overdue_amount.toFixed(2)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">30-Day Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialSummary.total_revenue_30d.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">90-Day Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialSummary.total_revenue_90d.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Year-to-Date Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialSummary.total_revenue_ytd.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Status */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Invoices</p>
                  <p className="text-2xl font-bold">{financialSummary.outstanding_invoices}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Invoices</p>
                  <p className="text-2xl font-bold text-destructive">{financialSummary.overdue_invoices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 10 charges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {financialSummary.recent_charges.map((charge: any) => (
                  <div key={charge.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{charge.description || "Charge"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(charge.created * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${charge.amount.toFixed(2)}</p>
                      <Badge variant={charge.status === "succeeded" ? "default" : "secondary"}>
                        {charge.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Platform Metrics (Owner Only) */}
      {isOwner && platformMetrics && (
        <>
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Platform Finance</h2>
                <p className="text-muted-foreground">SaaS metrics and subscriber analytics</p>
              </div>
              <Button onClick={syncPlatformMetrics} disabled={syncing} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                Sync Metrics
              </Button>
            </div>

            {/* MRR and Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${platformMetrics.mrr.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">ARR: ${(platformMetrics.mrr * 12).toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformMetrics.total_subscribers}</div>
                  <p className="text-xs text-muted-foreground">+{platformMetrics.new_signups_week} this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformMetrics.churn_rate.toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${platformMetrics.arpu.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Average Revenue Per User</p>
                </CardContent>
              </Card>
            </div>

            {/* Subscribers by Tier */}
            <Card>
              <CardHeader>
                <CardTitle>Subscribers by Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(platformMetrics.subscribers_by_tier).map(([tier, count]) => (
                    <div key={tier} className="border p-3 rounded">
                      <p className="text-sm font-medium">{tier.replace("ai_", "").replace("_", " ").toUpperCase()}</p>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">
                        ${((platformMetrics.revenue_by_tier[tier] || 0)).toFixed(2)}/mo
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
