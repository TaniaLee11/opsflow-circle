import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface SubscriptionSummary {
  tier: string;
  count: number;
  revenue: number;
}

export interface HourPurchase {
  id: string;
  organization_id: string;
  hours: number;
  amount_cents: number;
  stripe_payment_id: string | null;
  created_at: string;
}

export interface SubscriptionEvent {
  id: string;
  organization_id: string;
  event_type: string;
  amount_cents: number | null;
  currency: string;
  stripe_subscription_id: string | null;
  stripe_invoice_id: string | null;
  created_at: string;
}

export interface BillingReport {
  id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  data: unknown;
  generated_by: string;
  created_at: string;
}

export interface PlatformBillingData {
  subscriptionsByTier: SubscriptionSummary[];
  totalRevenue: number;
  totalSubscribers: number;
  hourPurchases: HourPurchase[];
  totalHoursPurchased: number;
  totalHoursRevenue: number;
  recentEvents: SubscriptionEvent[];
  savedReports: BillingReport[];
}

export function usePlatformBilling() {
  const { user, isOwner } = useAuth();
  const [data, setData] = useState<PlatformBillingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    if (!user?.id || !isOwner) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch profiles with subscriptions
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_confirmed')
        .eq('subscription_confirmed', true);

      if (profilesError) throw profilesError;

      // Group by tier
      const tierMap: Record<string, { count: number; revenue: number }> = {};
      const tierPrices: Record<string, number> = {
        'free': 0,
        'ai_free': 0,
        'ai_assistant': 34.99,
        'ai_operations': 99.99,
        'ai_enterprise': 499,
        'tax_1040_simple': 150,
        'tax_1040_c': 300,
        'tax_partnership': 750,
        'tax_scorp': 1250,
        'tax_ccorp': 1500,
        'tax_nonprofit': 1000,
        'tax_addon_state': 50,
        'advisory_hour': 125,
        'advisory_5pack': 500,
        'advisory_10pack': 1000,
      };

      for (const profile of profiles || []) {
        const tier = profile.subscription_tier || 'free';
        if (!tierMap[tier]) {
          tierMap[tier] = { count: 0, revenue: 0 };
        }
        tierMap[tier].count++;
        tierMap[tier].revenue += tierPrices[tier] || 0;
      }

      const subscriptionsByTier = Object.entries(tierMap).map(([tier, stats]) => ({
        tier,
        count: stats.count,
        revenue: stats.revenue
      }));

      const totalSubscribers = subscriptionsByTier.reduce((sum, s) => sum + s.count, 0);
      const totalRevenue = subscriptionsByTier.reduce((sum, s) => sum + s.revenue, 0);

      // Fetch hour purchases
      const { data: hourPurchases, error: hoursError } = await supabase
        .from('hour_purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (hoursError) throw hoursError;

      const totalHoursPurchased = (hourPurchases || []).reduce((sum, p) => sum + p.hours, 0);
      const totalHoursRevenue = (hourPurchases || []).reduce((sum, p) => sum + p.amount_cents, 0) / 100;

      // Fetch subscription events
      const { data: events, error: eventsError } = await supabase
        .from('subscription_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (eventsError) throw eventsError;

      // Fetch saved reports
      const { data: reports, error: reportsError } = await supabase
        .from('platform_billing_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (reportsError) throw reportsError;

      setData({
        subscriptionsByTier,
        totalRevenue,
        totalSubscribers,
        hourPurchases: hourPurchases || [],
        totalHoursPurchased,
        totalHoursRevenue,
        recentEvents: events || [],
        savedReports: (reports || []) as BillingReport[]
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch billing data';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isOwner]);

  const generateReport = useCallback(async (
    reportType: string,
    periodStart: string,
    periodEnd: string,
    reportData: Record<string, unknown>
  ) => {
    if (!user?.id || !isOwner) return null;

    try {
      const { data: report, error } = await supabase
        .from('platform_billing_reports')
        .insert([{
          report_type: reportType,
          period_start: periodStart,
          period_end: periodEnd,
          data: reportData as Json,
          generated_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Report generated successfully');
      fetchBillingData();
      return report;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate report';
      toast.error(msg);
      return null;
    }
  }, [user?.id, isOwner, fetchBillingData]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchBillingData,
    generateReport,
  };
}
