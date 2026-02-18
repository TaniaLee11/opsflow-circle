import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, AlertCircle, RefreshCw, Link as LinkIcon, BookOpen, ArrowRight, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier } from "@/contexts/UserTierContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ModeLabel, getTierMode } from "@/components/hub/ModeLabel";

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
  const { user, isOwner, isLoading: authLoading } = useAuth();
  const { currentTier } = useUserTier();
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  const userTier = currentTier || "free";
  const tierMode = getTierMode(userTier);

  // Tier access levels
  const isEducation = tierMode === "education"; // Free, Tax, Compliance
  const isGuided = tierMode === "guided"; // Assistant
  const isExecution = tierMode === "execution"; // Operations, Enterprise, Cohort
  const isLed = tierMode === "led"; // Advisory, Owner

  useEffect(() => {
    if (!authLoading && user) {
      loadFinancialData();
    }
  }, [user, authLoading]);

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

      if (integration && !isEducation) {
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // EDUCATION MODE (Free, Tax, Compliance)
  if (isEducation) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Finance Intelligence</h1>
            <p className="text-muted-foreground">Learn financial management fundamentals</p>
          </div>
          <ModeLabel tier={userTier} />
        </div>

        <Alert>
          <BookOpen className="w-4 h-4" />
          <AlertDescription>
            You're in <strong>Education Mode</strong>. Learn financial literacy basics and upgrade to connect your accounts.
          </AlertDescription>
        </Alert>

        {/* Financial Literacy Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Understanding Your Finances</CardTitle>
              <CardDescription>Essential financial concepts for business owners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Revenue vs Profit</h4>
                  <p className="text-sm text-muted-foreground">Learn the difference between top-line revenue and bottom-line profit</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Cash Flow Management</h4>
                  <p className="text-sm text-muted-foreground">Why cash flow is more important than profit for survival</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Invoice Management</h4>
                  <p className="text-sm text-muted-foreground">Best practices for billing clients and tracking payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What You'll Get with an Upgrade</CardTitle>
              <CardDescription>Connect your financial accounts and get real insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold">🧭 Assistant Tier ($39.99/mo)</h4>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>• Connect Stripe and QuickBooks</li>
                  <li>• See real-time revenue and expenses</li>
                  <li>• VOPSy tells you what to do next</li>
                  <li>• Invoice tracking and alerts</li>
                </ul>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">⚡ Operations Tier ($99.99/mo)</h4>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>• Everything in Assistant</li>
                  <li>• VOPSy sends invoice reminders automatically</li>
                  <li>• Automated follow-ups on overdue payments</li>
                  <li>• Proactive financial alerts</li>
                </ul>
              </div>
              <Button onClick={() => navigate("/services")} className="w-full">
                Connect Your Accounts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Financial Education Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Free Financial Education</CardTitle>
            <CardDescription>Start with these courses in the Academy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => navigate("/academy")} className="h-auto py-4 flex flex-col items-start">
                <span className="font-semibold">Understanding P&L Statements</span>
                <span className="text-xs text-muted-foreground mt-1">Stage 3: Understanding Your Numbers</span>
              </Button>
              <Button variant="outline" onClick={() => navigate("/academy")} className="h-auto py-4 flex flex-col items-start">
                <span className="font-semibold">Cash Flow Management</span>
                <span className="text-xs text-muted-foreground mt-1">Stage 3: Understanding Your Numbers</span>
              </Button>
              <Button variant="outline" onClick={() => navigate("/academy")} className="h-auto py-4 flex flex-col items-start">
                <span className="font-semibold">QuickBooks Basics</span>
                <span className="text-xs text-muted-foreground mt-1">Stage 2: Getting Organized</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // GUIDED, EXECUTION, LED MODES (Assistant+)
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Intelligence</h1>
          <p className="text-muted-foreground">
            {isGuided && "VOPSy analyzes your data and tells you what to do"}
            {isExecution && "VOPSy automates financial management for you"}
            {isLed && "Strategic financial planning with Tania"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ModeLabel tier={userTier} />
          {stripeConnected && (
            <Button onClick={syncStripeData} disabled={syncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              Sync Data
            </Button>
          )}
        </div>
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

      {/* VOPSy Integration Section */}
      {stripeConnected && financialSummary && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              VOPSy Financial Intelligence
            </CardTitle>
            <CardDescription>
              {isGuided && "VOPSy reads your data and provides direction"}
              {isExecution && "VOPSy takes action on your behalf"}
              {isLed && "Strategic insights from Tania"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {financialSummary.overdue_invoices > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Action Needed:</strong> You have {financialSummary.overdue_invoices} overdue invoice(s) totaling ${financialSummary.overdue_amount.toFixed(2)}.
                  {isGuided && " VOPSy recommends following up with these customers today."}
                  {isExecution && (
                    <Button size="sm" className="ml-2" onClick={() => toast.info("VOPSy is sending automated reminders...")}>
                      Send Automated Reminders
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {financialSummary.cash_flow_status === "warning" && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Cash Flow Warning:</strong> Your overdue invoices are impacting cash flow.
                  {isGuided && " VOPSy suggests prioritizing collections this week."}
                  {isExecution && " VOPSy has flagged at-risk accounts for automated follow-up."}
                </AlertDescription>
              </Alert>
            )}

            {isExecution && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🤖 Automation Status</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ Invoice reminders: Active (sends 3 days before due)</li>
                  <li>✅ Overdue follow-ups: Active (sends 1, 7, 14 days after due)</li>
                  <li>✅ Low cash flow alerts: Monitoring</li>
                  <li>✅ Unusual charge detection: Active</li>
                </ul>
              </div>
            )}

            {!isExecution && (
              <Alert>
                <Lock className="w-4 h-4" />
                <AlertDescription>
                  <strong>Additional access required</strong> to unlock automated invoice reminders, follow-ups, and proactive alerts.
                  <Button size="sm" variant="link" onClick={() => navigate("/services")}>
                    Learn More
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
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
