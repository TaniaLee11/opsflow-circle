import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Gift, Building2, TrendingUp, FileText, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { USER_TIERS, UserTierId } from "@/contexts/UserTierContext";

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

  const handleContinue = async () => {
    if (!selectedTier) return;
    
    setIsLoading(true);
    
    // In production, this would save to the database
    // For now, save to localStorage and proceed
    const userData = localStorage.getItem("vopsy_user");
    if (userData) {
      const user = JSON.parse(userData);
      user.tierSelected = true;
      user.selectedTier = selectedTier;
      localStorage.setItem("vopsy_user", JSON.stringify(user));
    }
    
    setIsLoading(false);
    navigate("/dashboard");
  };

  const tiers = Object.values(USER_TIERS);

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
                {tier.price !== null ? (
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
            {isLoading ? "Setting up..." : "Continue to Dashboard"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          You can change your tier anytime from settings
        </p>
      </motion.div>
    </div>
  );
}
