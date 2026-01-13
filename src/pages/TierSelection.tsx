import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Gift, Building2, TrendingUp, FileText, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { USER_TIERS, UserTierId } from "@/contexts/UserTierContext";
import { createCheckout, STRIPE_PRICES, FREE_TIERS, SUBSCRIPTION_TIERS, VARIABLE_PRICING_TIERS } from "@/lib/stripe";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const tierIcons: Record<UserTierId, React.ReactNode> = {
  free: <Gift className="w-6 h-6" />,
  ai_assistant: <Sparkles className="w-6 h-6" />,
  ai_operations: <Zap className="w-6 h-6" />,
  ai_enterprise: <Building2 className="w-6 h-6" />,
  ai_advisory: <TrendingUp className="w-6 h-6" />,
  ai_tax: <FileText className="w-6 h-6" />,
  ai_compliance: <Shield className="w-6 h-6" />,
};

export default function TierSelection() {
  const [selectedTier, setSelectedTier] = useState<UserTierId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const openCheckout = (url: string) => {
    // In embedded previews (iframes), top-level navigation can be blocked.
    // Prefer opening Stripe Checkout in a new tab and fall back to same-tab navigation.
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.href = url;
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleContinue = async () => {
    if (!selectedTier || !user) return;

    setIsLoading(true);

    try {
      // Save selected tier to localStorage with user ID
      const profileData = {
        tierSelected: true,
        selectedTier: selectedTier,
      };
      localStorage.setItem(`vopsy_profile_${user.id}`, JSON.stringify(profileData));

      // Also save to database
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase
        .from("profiles")
        .update({
          selected_tier: selectedTier,
          tier_selected: true,
          // For free tier, also confirm subscription immediately
          subscription_confirmed: FREE_TIERS.includes(selectedTier),
          subscription_tier: FREE_TIERS.includes(selectedTier) ? selectedTier : null,
        })
        .eq("user_id", user.id);

      // If free tier, go directly to dashboard
      if (FREE_TIERS.includes(selectedTier)) {
        toast.success("Welcome! You're all set with the Free tier.");
        setIsLoading(false);
        navigate("/dashboard");
        return;
      }

      // If variable pricing tier, redirect to product selection
      if (VARIABLE_PRICING_TIERS.includes(selectedTier)) {
        setIsLoading(false);
        navigate(`/select-product?tier=${selectedTier}`);
        return;
      }

      // Get the price ID for the selected tier
      const priceId = STRIPE_PRICES[selectedTier];
      if (!priceId) {
        toast.error("Price not configured for this tier");
        setIsLoading(false);
        return;
      }

      // Determine mode based on tier type
      const mode = SUBSCRIPTION_TIERS.includes(selectedTier) ? "subscription" : "payment";

      // Create Stripe checkout session
      const { url } = await createCheckout(priceId, mode);

      if (url) {
        toast.message("Opening Stripe Checkout…", { description: "If nothing happens, check your pop-up blocker." });
        openCheckout(url);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (!selectedTier) return "Select a Tier";
    if (FREE_TIERS.includes(selectedTier)) return "Continue to Dashboard";
    if (VARIABLE_PRICING_TIERS.includes(selectedTier)) return "Select Product Options";
    return "Continue to Checkout";
  };

  // Custom order: Free, Assistant, Operations first row; Advisory, Tax, Compliance second row; Enterprise last
  const tierOrder: UserTierId[] = ["free", "ai_assistant", "ai_operations", "ai_advisory", "ai_tax", "ai_compliance", "ai_enterprise"];
  const tiers = tierOrder.map(id => USER_TIERS[id]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6"
          >
            <Zap className="w-8 h-8 text-primary" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Choose Your Tier
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select the plan that best fits your business needs. You can upgrade or change your tier anytime.
          </p>
        </div>

        {/* Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {tiers.map((tier, index) => (
            <motion.button
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setSelectedTier(tier.id)}
              className={cn(
                "relative p-5 rounded-xl text-left transition-all duration-200",
                "border-2 bg-card hover:bg-muted/50",
                selectedTier === tier.id 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50"
              )}
            >
              {selectedTier === tier.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4",
                tier.color
              )}>
                {tierIcons[tier.id]}
              </div>
              
              <h3 className="font-semibold text-foreground mb-1">{tier.displayName}</h3>
              
              <div className="mb-3">
                {tier.priceLabel ? (
                  <span className="text-xl font-bold text-foreground">
                    {tier.priceLabel}
                  </span>
                ) : tier.price !== null ? (
                  <span className="text-xl font-bold text-foreground">
                    ${tier.price}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </span>
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">Free</span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tier.description}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          <button
            onClick={handleContinue}
            disabled={!selectedTier || isLoading}
            className={cn(
              "px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all",
              selectedTier 
                ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {getButtonText()}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          You can change your tier anytime from settings
        </p>
      </motion.div>
    </div>
  );
}
