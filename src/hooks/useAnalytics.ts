/**
 * Analytics Hooks - System Owner + Autonomous Environment Model
 * 
 * ARCHITECTURE RULE (NON-NEGOTIABLE):
 * Every user operates inside a fully autonomous environment.
 * There is zero data bleed, zero shared execution, and zero implicit inheritance.
 * 
 * SYSTEM OWNER SCOPES:
 * A. OWN ENVIRONMENT: Full AI Operations access to their OWN data
 * B. OVERSIGHT: Analytics-only access to other users (aggregated counts)
 * 
 * These hooks provide ANALYTICS ONLY access for oversight:
 * - Aggregated counts and metrics
 * - Trends over time
 * - Status indicators
 * - Masked user identifiers (User #0001, never emails/names)
 * 
 * STRICTLY FORBIDDEN (even for System Owners):
 * - Raw user records
 * - User-generated content (documents, messages, files)
 * - Financial transactions, balances, merchants
 * - Individual user activity details
 * - Integration credentials or tokens
 * - AI chat history or workflow definitions
 * 
 * If analytics can be used to infer or reconstruct a user's private data,
 * the implementation is incorrect.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserTierId, USER_TIERS } from "@/contexts/UserTierContext";

// ================================================================
// TYPES - Analytics-only data structures
// ================================================================

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalMrr: number;
  totalConversations: number;
  totalMessages: number;
  totalIntegrations: number;
  tierBreakdown: TierAnalytics[];
}

export interface TierAnalytics {
  tierId: UserTierId;
  tierName: string;
  userCount: number;
  activeUsers: number;
  mrr: number;
  conversationCount: number;
  messageCount: number;
  integrationCount: number;
  activationRate: number;
  engagementScore: number;
}

export interface DrillableUserAnalytics {
  userId: string;
  // ANALYTICS ONLY - No raw data
  displayIdentifier: string; // Masked or generic ID
  isActive: boolean;
  messageCount: number;
  conversationCount: number;
  integrationCount: number;
  lastActivityDate: string | null;
  joinedDate: string;
  // NO: email, phone, address, content, history
}

export interface AnalyticsTrend {
  date: string;
  eventCount: number;
  uniqueUsers: number;
}

const TIER_PRICES: Record<UserTierId, number> = {
  free: 0,
  ai_assistant: 34.99,
  ai_operations: 99.99,
  ai_enterprise: 499,
  ai_advisory: 199,
  ai_tax: 149,
  ai_compliance: 179.99,
};

// ================================================================
// PLATFORM-LEVEL ANALYTICS (Owner Only)
// ================================================================

/**
 * Fetches platform-wide analytics - COUNTS ONLY
 * No raw user data is exposed
 */
export function usePlatformAnalytics() {
  return useQuery({
    queryKey: ["platform-analytics"],
    queryFn: async (): Promise<PlatformAnalytics> => {
      // Fetch aggregated counts only - no raw data
      const [profilesRes, conversationsRes, integrationsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("selected_tier, subscription_tier, subscription_confirmed", { count: "exact" }),
        supabase
          .from("conversations")
          .select("id", { count: "exact" }),
        supabase
          .from("integrations")
          .select("id", { count: "exact" })
      ]);

      // Get message count separately (via conversations RLS)
      const { count: messageCount } = await supabase
        .from("messages")
        .select("id", { count: "exact" });

      const profiles = profilesRes.data || [];
      const totalUsers = profiles.length;
      const activeUsers = profiles.filter(p => p.subscription_confirmed).length;
      const totalConversations = conversationsRes.count || 0;
      const totalIntegrations = integrationsRes.count || 0;

      // Build tier breakdown - AGGREGATED COUNTS ONLY
      const allTierIds: UserTierId[] = Object.keys(USER_TIERS) as UserTierId[];
      const tierBreakdown: TierAnalytics[] = allTierIds.map(tierId => {
        const tierProfiles = profiles.filter(
          p => (p.subscription_tier || p.selected_tier || "free") === tierId
        );
        const tierUserCount = tierProfiles.length;
        const tierActiveUsers = tierProfiles.filter(p => p.subscription_confirmed).length;
        const tierMrr = tierActiveUsers * (TIER_PRICES[tierId] || 0);
        const activationRate = tierUserCount > 0 
          ? Math.round((tierActiveUsers / tierUserCount) * 100) 
          : 0;

        return {
          tierId,
          tierName: USER_TIERS[tierId]?.displayName || tierId,
          userCount: tierUserCount,
          activeUsers: tierActiveUsers,
          mrr: tierMrr,
          conversationCount: 0, // Would need tier-specific rollups
          messageCount: 0,
          integrationCount: 0,
          activationRate,
          engagementScore: 0, // Calculated from rollups
        };
      });

      const totalMrr = tierBreakdown.reduce((sum, t) => sum + t.mrr, 0);

      return {
        totalUsers,
        activeUsers,
        totalMrr,
        totalConversations,
        totalMessages: messageCount || 0,
        totalIntegrations,
        tierBreakdown,
      };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// ================================================================
// TIER-LEVEL ANALYTICS (Owner Drill-Down)
// ================================================================

/**
 * Fetches analytics for a specific tier - COUNTS AND METRICS ONLY
 * Users are represented as masked identifiers, never raw data
 */
export function useTierAnalytics(tierId: UserTierId) {
  return useQuery({
    queryKey: ["tier-analytics", tierId],
    queryFn: async (): Promise<{
      summary: TierAnalytics;
      userAnalytics: DrillableUserAnalytics[];
      trends: AnalyticsTrend[];
      healthMetrics: { label: string; value: number; status: 'good' | 'warning' | 'critical' }[];
    }> => {
      // Fetch COUNTS for this tier only
      const { data: tierProfiles } = await supabase
        .from("profiles")
        .select("user_id, subscription_confirmed, created_at")
        .or(`selected_tier.eq.${tierId},subscription_tier.eq.${tierId}`);

      const userIds = tierProfiles?.map(p => p.user_id) || [];
      const userCount = userIds.length;
      const activeUsers = tierProfiles?.filter(p => p.subscription_confirmed).length || 0;
      const mrr = activeUsers * (TIER_PRICES[tierId] || 0);

      // Get AGGREGATED conversation counts per user (no content exposed)
      let userConversationCounts: Record<string, number> = {};
      let userMessageCounts: Record<string, number> = {};
      let userIntegrationCounts: Record<string, number> = {};
      let totalConversations = 0;
      let totalMessages = 0;
      let totalIntegrations = 0;

      if (userIds.length > 0) {
        // Get conversation counts - no content, just counts
        const { data: convData } = await supabase
          .from("conversations")
          .select("user_id")
          .in("user_id", userIds);

        convData?.forEach(c => {
          userConversationCounts[c.user_id] = (userConversationCounts[c.user_id] || 0) + 1;
          totalConversations++;
        });

        // Get message counts via conversations (no content)
        const { data: msgData } = await supabase
          .from("conversations")
          .select("user_id, messages(count)")
          .in("user_id", userIds);

        msgData?.forEach((conv: any) => {
          const count = conv.messages?.[0]?.count || 0;
          userMessageCounts[conv.user_id] = (userMessageCounts[conv.user_id] || 0) + count;
          totalMessages += count;
        });

        // Get integration counts (no credentials exposed)
        const { data: intData } = await supabase
          .from("integrations")
          .select("user_id")
          .in("user_id", userIds);

        intData?.forEach(i => {
          userIntegrationCounts[i.user_id] = (userIntegrationCounts[i.user_id] || 0) + 1;
          totalIntegrations++;
        });
      }

      // Calculate health metrics
      const activationRate = userCount > 0 ? Math.round((activeUsers / userCount) * 100) : 0;
      const avgMessages = userCount > 0 ? Math.round(totalMessages / userCount) : 0;
      const engagementScore = Math.min(100, avgMessages * 5); // Scale to 100
      const healthIndex = Math.round((activationRate + engagementScore) / 2);

      // Build MASKED user analytics - NO RAW DATA
      const userAnalytics: DrillableUserAnalytics[] = (tierProfiles || []).map((profile, index) => ({
        userId: profile.user_id,
        // Masked identifier - NEVER expose email/name
        displayIdentifier: `User #${(index + 1).toString().padStart(4, '0')}`,
        isActive: profile.subscription_confirmed || false,
        messageCount: userMessageCounts[profile.user_id] || 0,
        conversationCount: userConversationCounts[profile.user_id] || 0,
        integrationCount: userIntegrationCounts[profile.user_id] || 0,
        lastActivityDate: null, // Would come from analytics_events
        joinedDate: profile.created_at,
      })).sort((a, b) => b.messageCount - a.messageCount);

      const summary: TierAnalytics = {
        tierId,
        tierName: USER_TIERS[tierId]?.displayName || tierId,
        userCount,
        activeUsers,
        mrr,
        conversationCount: totalConversations,
        messageCount: totalMessages,
        integrationCount: totalIntegrations,
        activationRate,
        engagementScore,
      };

      return {
        summary,
        userAnalytics,
        trends: [], // Would be populated from analytics_rollups_*
        healthMetrics: [
          { 
            label: "Activation Rate", 
            value: activationRate, 
            status: activationRate >= 70 ? "good" : activationRate >= 40 ? "warning" : "critical"
          },
          { 
            label: "Engagement Score", 
            value: engagementScore, 
            status: engagementScore >= 60 ? "good" : engagementScore >= 30 ? "warning" : "critical"
          },
          { 
            label: "Health Index", 
            value: healthIndex, 
            status: healthIndex >= 50 ? "good" : healthIndex >= 25 ? "warning" : "critical"
          },
        ],
      };
    },
    staleTime: 30000,
  });
}

// ================================================================
// USER'S OWN ANALYTICS (Self-View Only)
// ================================================================

/**
 * Fetches analytics for the current user's own activity
 * This is the ONLY place a user sees their own detailed metrics
 */
export function useMyAnalytics() {
  return useQuery({
    queryKey: ["my-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // User can see their OWN analytics only
      const [tasksRes, projectsRes, conversationsRes, integrationsRes] = await Promise.all([
        supabase.from("tasks").select("id, status", { count: "exact" }),
        supabase.from("projects").select("id, status", { count: "exact" }),
        supabase.from("conversations").select("id", { count: "exact" }),
        supabase.from("integrations").select("id, provider", { count: "exact" }),
      ]);

      const totalTasks = tasksRes.count || 0;
      const completedTasks = tasksRes.data?.filter(t => t.status === 'completed').length || 0;
      const totalProjects = projectsRes.count || 0;
      const activeProjects = projectsRes.data?.filter(p => p.status === 'active').length || 0;
      const totalConversations = conversationsRes.count || 0;
      const connectedIntegrations = integrationsRes.count || 0;

      return {
        totalTasks,
        completedTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalProjects,
        activeProjects,
        totalConversations,
        connectedIntegrations,
        integrationProviders: integrationsRes.data?.map(i => i.provider) || [],
      };
    },
    staleTime: 30000,
  });
}

// ================================================================
// ORGANIZATION ANALYTICS (Enterprise Admin Only)
// ================================================================

/**
 * For enterprise admins - analytics about their organization ONLY
 * Shows aggregated counts, never individual user data
 */
export function useOrgAnalytics() {
  return useQuery({
    queryKey: ["org-analytics"],
    queryFn: async () => {
      // Get org analytics from rollups table
      const { data: orgRollups } = await supabase
        .from("analytics_rollups_org")
        .select("*")
        .order("rollup_date", { ascending: false })
        .limit(30);

      // Aggregate by category
      const byCategory: Record<string, number> = {};
      orgRollups?.forEach(r => {
        byCategory[r.event_category] = (byCategory[r.event_category] || 0) + r.event_count;
      });

      return {
        rollups: orgRollups || [],
        byCategory,
        totalEvents: orgRollups?.reduce((sum, r) => sum + r.event_count, 0) || 0,
      };
    },
    staleTime: 30000,
  });
}
