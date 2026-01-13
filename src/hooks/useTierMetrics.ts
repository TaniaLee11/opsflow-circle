import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserTierId, USER_TIERS } from "@/contexts/UserTierContext";

export interface TierStats {
  tierId: UserTierId;
  userCount: number;
  activeUsers: number;
  mrr: number;
  conversationCount: number;
  messageCount: number;
  integrationCount: number;
  retentionRate: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalMrr: number;
  totalConversations: number;
  tierStats: Record<UserTierId, TierStats>;
}

const TIER_PRICES: Record<UserTierId, number> = {
  free: 0,
  ai_assistant: 34.99,
  ai_operations: 99.99,
  ai_enterprise: 499,
  ai_advisory: 199, // avg estimate
  ai_tax: 149,
  ai_compliance: 179.99,
};

async function fetchTierMetrics(): Promise<PlatformStats> {
  // Fetch user counts by tier
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("selected_tier, subscription_confirmed, subscription_tier, user_id, created_at");

  if (profilesError) throw profilesError;

  // Fetch conversation counts per user
  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select("user_id, id");

  if (convError) throw convError;

  // Fetch message counts
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("conversation_id");

  if (msgError) throw msgError;

  // Fetch integration counts
  const { data: integrations, error: intError } = await supabase
    .from("integrations")
    .select("user_id, provider, health");

  if (intError) throw intError;

  // Fetch subscription events for revenue
  const { data: subscriptionEvents, error: subError } = await supabase
    .from("subscription_events")
    .select("event_type, amount_cents, organization_id, created_at")
    .eq("event_type", "subscription_created")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (subError) throw subError;

  // Initialize tier stats
  const allTierIds: UserTierId[] = Object.keys(USER_TIERS) as UserTierId[];
  const tierStats: Record<UserTierId, TierStats> = {} as Record<UserTierId, TierStats>;

  allTierIds.forEach((tierId) => {
    tierStats[tierId] = {
      tierId,
      userCount: 0,
      activeUsers: 0,
      mrr: 0,
      conversationCount: 0,
      messageCount: 0,
      integrationCount: 0,
      retentionRate: 0,
    };
  });

  // Count users per tier
  const userTierMap: Record<string, UserTierId> = {};
  profiles?.forEach((profile) => {
    const tier = (profile.subscription_tier || profile.selected_tier || "free") as UserTierId;
    if (tierStats[tier]) {
      tierStats[tier].userCount++;
      userTierMap[profile.user_id] = tier;
      
      // Active if subscription confirmed or free tier
      if (profile.subscription_confirmed || tier === "free") {
        tierStats[tier].activeUsers++;
      }
    }
  });

  // Calculate MRR per tier (active subscribers * price)
  allTierIds.forEach((tierId) => {
    const price = TIER_PRICES[tierId] || 0;
    tierStats[tierId].mrr = tierStats[tierId].activeUsers * price;
  });

  // Count conversations per tier
  const userConversations: Record<string, number> = {};
  conversations?.forEach((conv) => {
    userConversations[conv.user_id] = (userConversations[conv.user_id] || 0) + 1;
    const tier = userTierMap[conv.user_id];
    if (tier && tierStats[tier]) {
      tierStats[tier].conversationCount++;
    }
  });

  // Count messages per tier (via conversation)
  const conversationUserMap: Record<string, string> = {};
  conversations?.forEach((conv) => {
    conversationUserMap[conv.id] = conv.user_id;
  });

  messages?.forEach((msg) => {
    const userId = conversationUserMap[msg.conversation_id];
    if (userId) {
      const tier = userTierMap[userId];
      if (tier && tierStats[tier]) {
        tierStats[tier].messageCount++;
      }
    }
  });

  // Count integrations per tier
  integrations?.forEach((integration) => {
    const tier = userTierMap[integration.user_id];
    if (tier && tierStats[tier]) {
      tierStats[tier].integrationCount++;
    }
  });

  // Calculate totals
  const totalUsers = profiles?.length || 0;
  const totalMrr = Object.values(tierStats).reduce((sum, stat) => sum + stat.mrr, 0);
  const totalConversations = conversations?.length || 0;

  return {
    totalUsers,
    totalMrr,
    totalConversations,
    tierStats,
  };
}

export function useTierMetrics() {
  return useQuery({
    queryKey: ["tier-metrics"],
    queryFn: fetchTierMetrics,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
}

// Hook for individual tier portal data
export function useTierPortalData(tierId: UserTierId) {
  return useQuery({
    queryKey: ["tier-portal", tierId],
    queryFn: async () => {
      // Get users for this tier
      const { data: tierProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, email, created_at, subscription_confirmed")
        .or(`selected_tier.eq.${tierId},subscription_tier.eq.${tierId}`);

      if (profilesError) throw profilesError;

      const userIds = tierProfiles?.map((p) => p.user_id) || [];

      // Get recent conversations for these users
      let recentActivity: { action: string; user: string; time: string }[] = [];
      if (userIds.length > 0) {
        const { data: recentConvs } = await supabase
          .from("conversations")
          .select("user_id, title, created_at, updated_at")
          .in("user_id", userIds)
          .order("updated_at", { ascending: false })
          .limit(10);

        recentActivity = (recentConvs || []).map((conv) => {
          const user = tierProfiles?.find((p) => p.user_id === conv.user_id);
          const timeDiff = Date.now() - new Date(conv.updated_at).getTime();
          const timeStr = timeDiff < 60000 ? "just now" :
            timeDiff < 3600000 ? `${Math.floor(timeDiff / 60000)} min ago` :
            timeDiff < 86400000 ? `${Math.floor(timeDiff / 3600000)} hours ago` :
            `${Math.floor(timeDiff / 86400000)} days ago`;

          return {
            action: conv.title || "VOPSy conversation",
            user: user?.display_name || user?.email?.split("@")[0] || "Unknown",
            time: timeStr,
          };
        });
      }

      // Get message counts per user
      const { data: userMessages } = await supabase
        .from("conversations")
        .select("user_id, messages(count)")
        .in("user_id", userIds);

      const messageCounts: Record<string, number> = {};
      userMessages?.forEach((conv: any) => {
        const count = conv.messages?.[0]?.count || 0;
        messageCounts[conv.user_id] = (messageCounts[conv.user_id] || 0) + count;
      });

      // Build top users list
      const topUsers = (tierProfiles || [])
        .map((profile) => ({
          name: profile.display_name || profile.email?.split("@")[0] || "Unknown",
          email: profile.email || "",
          activity: `${messageCounts[profile.user_id] || 0} messages`,
          revenue: profile.subscription_confirmed ? `$${TIER_PRICES[tierId]}/mo` : undefined,
        }))
        .sort((a, b) => {
          const aCount = parseInt(a.activity) || 0;
          const bCount = parseInt(b.activity) || 0;
          return bCount - aCount;
        })
        .slice(0, 5);

      // Calculate health metrics
      const totalUsers = tierProfiles?.length || 0;
      const activeUsers = tierProfiles?.filter((p) => p.subscription_confirmed).length || 0;
      const activationRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

      const totalMessages = Object.values(messageCounts).reduce((sum, count) => sum + count, 0);
      const engagementRate = totalUsers > 0 ? Math.min(100, Math.round((totalMessages / totalUsers) * 10)) : 0;

      return {
        userCount: totalUsers,
        activeUsers,
        mrr: activeUsers * TIER_PRICES[tierId],
        recentActivity,
        topUsers,
        healthMetrics: [
          { 
            label: "Activation Rate", 
            value: activationRate, 
            status: activationRate >= 70 ? "good" as const : activationRate >= 40 ? "warning" as const : "critical" as const 
          },
          { 
            label: "Engagement Score", 
            value: engagementRate, 
            status: engagementRate >= 60 ? "good" as const : engagementRate >= 30 ? "warning" as const : "critical" as const 
          },
          { 
            label: "Health Index", 
            value: Math.round((activationRate + engagementRate) / 2), 
            status: (activationRate + engagementRate) / 2 >= 50 ? "good" as const : "warning" as const 
          },
        ],
      };
    },
    staleTime: 30000,
  });
}
