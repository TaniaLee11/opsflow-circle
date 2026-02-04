import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is platform owner
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'platform_owner') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Platform owner access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate platform metrics
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all organizations with subscription data
    const { data: organizations } = await supabaseClient
      .from('organizations')
      .select('*');

    if (!organizations) {
      throw new Error('Failed to fetch organizations');
    }

    // Calculate tier distribution
    const tierDistribution = {
      AI_FREE: 0,
      AI_ASSISTANT: 0,
      AI_OPERATIONS: 0,
    };

    let totalMRR = 0;
    const revenueByTier = {
      AI_ASSISTANT: 0,
      AI_OPERATIONS: 0,
    };

    const tierPricing = {
      AI_ASSISTANT: 34.99,
      AI_OPERATIONS: 99.99,
    };

    organizations.forEach(org => {
      const tier = org.subscription_tier || 'AI_FREE';
      
      if (tier in tierDistribution) {
        tierDistribution[tier as keyof typeof tierDistribution]++;
      }

      if (tier === 'AI_ASSISTANT' || tier === 'AI_OPERATIONS') {
        const revenue = tierPricing[tier as keyof typeof tierPricing];
        totalMRR += revenue;
        revenueByTier[tier as keyof typeof revenueByTier] += revenue;
      }
    });

    // Calculate MRR growth (simplified - would need historical data for accurate calculation)
    const paidUsersCount = tierDistribution.AI_ASSISTANT + tierDistribution.AI_OPERATIONS;
    const mrrGrowth = 0; // TODO: Calculate from historical data

    // Get new users this month
    const { count: newUsersCount } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayThisMonth.toISOString());

    // Calculate churn (simplified)
    const churnedUsersThisMonth = 0; // TODO: Track subscription cancellations
    const churnRate = paidUsersCount > 0 
      ? (churnedUsersThisMonth / paidUsersCount) * 100 
      : 0;

    // Get total and active users
    const { count: totalUsers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Active users = users who logged in within last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const { count: activeUsers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString());

    // Calculate average revenue per user
    const avgRevenuePerUser = paidUsersCount > 0 
      ? totalMRR / paidUsersCount 
      : 0;

    // Get top clients by revenue
    const topClients = organizations
      .filter(org => org.subscription_tier === 'AI_ASSISTANT' || org.subscription_tier === 'AI_OPERATIONS')
      .map(org => ({
        name: org.name,
        tier: org.subscription_tier,
        mrr: tierPricing[org.subscription_tier as keyof typeof tierPricing] || 0,
      }))
      .sort((a, b) => b.mrr - a.mrr)
      .slice(0, 5);

    const metrics = {
      mrr: totalMRR,
      mrrGrowth,
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersThisMonth: newUsersCount || 0,
      churnedUsersThisMonth,
      churnRate,
      tierDistribution,
      revenueByTier,
      avgRevenuePerUser,
      lifetimeValue: avgRevenuePerUser * 12, // Simplified LTV calculation
      topClients,
    };

    return new Response(
      JSON.stringify(metrics),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Platform metrics error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
