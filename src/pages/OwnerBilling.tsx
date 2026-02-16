import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/layout/Navigation";
import { usePlatformBilling } from "@/hooks/usePlatformBilling";
import { FinancialExportButton } from "@/components/financial/FinancialExportButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Users, 
  Clock, 
  CreditCard, 
  TrendingUp,
  FileText,
  RefreshCw,
  Loader2,
  Receipt,
  BarChart3,
  Calendar,
  ArrowUpRight,
  Building2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const TIER_NAMES: Record<string, string> = {
  'free': 'Free',
  'ai_free': 'AI Free',
  'ai_assistant': 'AI Assistant',
  'ai_operations': 'AI Operations',
  'ai_enterprise': 'AI Enterprise',
  'tax_1040_simple': '1040 Simple',
  'tax_1040_c': '1040 w/Schedule C',
  'tax_partnership': 'Partnership',
  'tax_scorp': 'S-Corp',
  'tax_ccorp': 'C-Corp',
  'tax_nonprofit': 'Nonprofit 990',
  'advisory_hour': 'Advisory Hour',
  'cohort': 'Cohort Member',
  'owner': 'Platform Owner',
};

export default function OwnerBilling() {
  const { isAuthenticated, isOwner } = useAuth();
  const { data, isLoading, refresh } = usePlatformBilling();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  // Export data
  const subscriptionExportData = {
    title: 'Subscription Revenue Report',
    headers: ['Tier', 'Subscribers', 'Monthly Revenue'],
    rows: (data?.subscriptionsByTier || []).map(s => [
      TIER_NAMES[s.tier] || s.tier,
      s.count.toString(),
      `$${s.revenue.toFixed(2)}`
    ]),
    generatedAt: new Date().toLocaleString()
  };

  const hoursExportData = {
    title: 'Hour Purchases Report',
    headers: ['Date', 'Hours', 'Amount'],
    rows: (data?.hourPurchases || []).map(p => [
      format(new Date(p.created_at), 'MMM d, yyyy'),
      p.hours.toString(),
      `$${(p.amount_cents / 100).toFixed(2)}`
    ]),
    generatedAt: new Date().toLocaleString()
  };

  const eventsExportData = {
    title: 'Subscription Events Report',
    headers: ['Date', 'Event', 'Amount'],
    rows: (data?.recentEvents || []).map(e => [
      format(new Date(e.created_at), 'MMM d, yyyy HH:mm'),
      e.event_type,
      e.amount_cents ? `$${(e.amount_cents / 100).toFixed(2)}` : '-'
    ]),
    generatedAt: new Date().toLocaleString()
  };

  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        {/* Header */}
        <header className="sticky top-0 lg:top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Platform Billing</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Revenue, subscriptions & hour purchases</p>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="gap-2 w-fit"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass gradient-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-success/10">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                ${(data?.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Recurring</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass gradient-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {data?.totalSubscribers || 0}
              </p>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass gradient-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-info/10">
                  <Clock className="w-5 h-5 text-info" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {data?.totalHoursPurchased || 0}
              </p>
              <p className="text-sm text-muted-foreground">Hours Purchased</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass gradient-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-warning/10">
                  <CreditCard className="w-5 h-5 text-warning" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                ${(data?.totalHoursRevenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Hours Revenue</p>
            </motion.div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Payment History
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscriptions by Tier */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Subscription Revenue
                        </CardTitle>
                        <CardDescription>Revenue breakdown by tier</CardDescription>
                      </div>
                      <FinancialExportButton data={subscriptionExportData} filename="subscription-revenue" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(data?.subscriptionsByTier || []).length > 0 ? (
                        data?.subscriptionsByTier.map((tier, index) => (
                          <motion.div
                            key={tier.tier}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="capitalize">
                                {TIER_NAMES[tier.tier] || tier.tier}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {tier.count} subscriber{tier.count !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <span className="font-semibold text-foreground">
                              ${tier.revenue.toFixed(2)}
                            </span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p>No subscription data yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Hour Purchases */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          Hour Purchases
                        </CardTitle>
                        <CardDescription>Advisory & consulting hours sold</CardDescription>
                      </div>
                      <FinancialExportButton data={hoursExportData} filename="hour-purchases" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(data?.hourPurchases || []).length > 0 ? (
                        data?.hourPurchases.slice(0, 5).map((purchase, index) => (
                          <motion.div
                            key={purchase.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-info/10">
                                <Clock className="w-4 h-4 text-info" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{purchase.hours} hours</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(purchase.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-foreground">
                              ${(purchase.amount_cents / 100).toFixed(2)}
                            </span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p>No hour purchases yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Events */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Recent Payment Events
                      </CardTitle>
                      <CardDescription>Subscription and payment activity</CardDescription>
                    </div>
                    <FinancialExportButton data={eventsExportData} filename="payment-events" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(data?.recentEvents || []).length > 0 ? (
                      data?.recentEvents.slice(0, 10).map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              event.event_type.includes('paid') || event.event_type.includes('completed')
                                ? "bg-success/10"
                                : event.event_type.includes('failed')
                                ? "bg-destructive/10"
                                : "bg-muted"
                            )}>
                              <Receipt className={cn(
                                "w-4 h-4",
                                event.event_type.includes('paid') || event.event_type.includes('completed')
                                  ? "text-success"
                                  : event.event_type.includes('failed')
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              )} />
                            </div>
                            <div>
                              <p className="font-medium text-foreground capitalize">
                                {event.event_type.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          {event.amount_cents && (
                            <span className="font-semibold text-foreground">
                              ${(event.amount_cents / 100).toFixed(2)}
                            </span>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No payment events yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Full Payment History
                      </CardTitle>
                      <CardDescription>All subscription events and payments</CardDescription>
                    </div>
                    <FinancialExportButton data={eventsExportData} filename="full-payment-history" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(data?.recentEvents || []).length > 0 ? (
                      data?.recentEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow"
                        >
                          <div className={cn(
                            "p-2.5 rounded-lg shrink-0",
                            event.event_type.includes('paid') || event.event_type.includes('completed')
                              ? "bg-success/10"
                              : event.event_type.includes('failed')
                              ? "bg-destructive/10"
                              : event.event_type.includes('canceled') || event.event_type.includes('deleted')
                              ? "bg-warning/10"
                              : "bg-muted"
                          )}>
                            <Receipt className={cn(
                              "w-5 h-5",
                              event.event_type.includes('paid') || event.event_type.includes('completed')
                                ? "text-success"
                                : event.event_type.includes('failed')
                                ? "text-destructive"
                                : event.event_type.includes('canceled') || event.event_type.includes('deleted')
                                ? "text-warning"
                                : "text-muted-foreground"
                            )} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground capitalize">
                              {event.event_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(event.created_at), 'MMMM d, yyyy h:mm a')}
                            </p>
                            {event.stripe_subscription_id && (
                              <p className="text-xs text-muted-foreground font-mono mt-1">
                                {event.stripe_subscription_id}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            {event.amount_cents ? (
                              <p className="font-bold text-foreground">
                                ${(event.amount_cents / 100).toFixed(2)}
                              </p>
                            ) : (
                              <p className="text-muted-foreground">-</p>
                            )}
                            <p className="text-xs text-muted-foreground uppercase">
                              {event.currency}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">No payment history yet</p>
                        <p className="text-sm">Payment events will appear here as they occur</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
