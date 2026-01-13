import { supabase } from "@/integrations/supabase/client";

// Price IDs from Stripe
export const STRIPE_PRICES = {
  // Subscription tiers
  assistant: "price_1Sh16AJ3R9oDKFd40hVGZlfE", // $34.99/month
  operations: "price_1Sh19gJ3R9oDKFd4ftPwaGcS", // $99.99/month
  enterprise: "price_1Sh1TfJ3R9oDKFd4DcGU9izr", // $499/month
  free: "price_1Sk4YLJ3R9oDKFd4mgxV1oiw", // $0/month
  
  // One-time services
  personalTax: "price_1Sk56qJ3R9oDKFd4xzJQi6Ch", // $125
  personalBusinessTax: "price_1Sk588J3R9oDKFd47tkpsRsM", // $175
  businessTax: "price_1Sk59VJ3R9oDKFd4YXwHdTa9", // $250
} as const;

export const TIER_NAMES: Record<string, string> = {
  assistant: "AI Assistant",
  operations: "AI Operations",
  enterprise: "AI Enterprise",
  free: "AI Free",
};

export const TIER_PRICES: Record<string, number> = {
  assistant: 3499,
  operations: 9999,
  enterprise: 49900,
  free: 0,
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
