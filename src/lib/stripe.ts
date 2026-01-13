import { supabase } from "@/integrations/supabase/client";
import { UserTierId } from "@/contexts/UserTierContext";

// Price IDs from Stripe - mapped to UserTierId
export const STRIPE_PRICES: Record<string, string> = {
  // Subscription tiers
  free: "price_1Sk4YLJ3R9oDKFd4mgxV1oiw", // $0/month
  ai_assistant: "price_1Sh16AJ3R9oDKFd40hVGZlfE", // $34.99/month
  ai_operations: "price_1Sh19gJ3R9oDKFd4ftPwaGcS", // $99.99/month
  ai_enterprise: "price_1Sh1TfJ3R9oDKFd4DcGU9izr", // $499/month
  ai_advisory: "price_1Sox4DJ3R9oDKFd4uzradhaH", // $125/hour (non-profit) - hourly billing
  ai_tax: "price_1Sk56qJ3R9oDKFd4xzJQi6Ch", // $125 one-time
  ai_compliance: "price_1Sk588J3R9oDKFd47tkpsRsM", // $175 one-time
  
  // AI Advisory hourly rates
  advisoryNonProfit: "price_1Sox4DJ3R9oDKFd4uzradhaH", // $125/hour
  advisoryForProfit: "price_1Sox4MJ3R9oDKFd4RdC2PcGv", // $150/hour
  
  // One-time services (legacy)
  personalTax: "price_1Sk56qJ3R9oDKFd4xzJQi6Ch", // $125
  personalBusinessTax: "price_1Sk588J3R9oDKFd47tkpsRsM", // $175
  businessTax: "price_1Sk59VJ3R9oDKFd4YXwHdTa9", // $250
} as const;

// Tiers that are free (no Stripe checkout needed)
export const FREE_TIERS: UserTierId[] = ["free"];

// Tiers that are subscription-based
export const SUBSCRIPTION_TIERS: UserTierId[] = ["ai_assistant", "ai_operations", "ai_enterprise"];

// Tiers that are one-time payments
export const ONETIME_TIERS: UserTierId[] = [];

// Tiers that have variable pricing (require product selection)
export const VARIABLE_PRICING_TIERS: UserTierId[] = ["ai_advisory", "ai_tax", "ai_compliance"];

export const TIER_NAMES: Record<string, string> = {
  free: "AI Free",
  ai_assistant: "AI Assistant",
  ai_operations: "AI Operations",
  ai_enterprise: "AI Enterprise",
  ai_advisory: "AI Advisory",
  ai_tax: "AI Tax",
  ai_compliance: "AI Compliance",
};

export const TIER_PRICES: Record<string, number> = {
  free: 0,
  ai_assistant: 3499,
  ai_operations: 9999,
  ai_enterprise: 49900,
  ai_advisory: 19999,
  ai_tax: 14999,
  ai_compliance: 17999,
};

export interface SubscriptionStatus {
  subscribed: boolean;
  tier: string;
  product_id: string | null;
  subscription_end: string | null;
  cancel_at_period_end?: boolean;
}

export async function createCheckout(priceId: string, mode: "subscription" | "payment" = "subscription") {
  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: { priceId, mode },
  });

  if (error) throw new Error(error.message);
  return data as { url: string; sessionId: string };
}

export async function checkSubscription(): Promise<SubscriptionStatus> {
  const { data, error } = await supabase.functions.invoke("check-subscription");

  if (error) {
    console.error("Error checking subscription:", error);
    return {
      subscribed: false,
      tier: "free",
      product_id: null,
      subscription_end: null,
    };
  }

  return data as SubscriptionStatus;
}

export async function openCustomerPortal() {
  const { data, error } = await supabase.functions.invoke("customer-portal");

  if (error) throw new Error(error.message);
  
  if (data?.url) {
    window.open(data.url, "_blank");
  }
  
  return data as { url: string };
}
