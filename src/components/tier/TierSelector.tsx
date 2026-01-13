import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Sparkles, Crown, Zap, Rocket, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier, UserTierId } from "@/contexts/UserTierContext";
import { TierBadge } from "./TierBadge";

export function TierSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { isOwner, isAdmin } = useAuth();
  const { currentTier, allTiers, setTier, isCohort } = useUserTier();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border transition-colors"
      >
        <TierBadge size="md" />
        {isCohort && (
          <span className="text-[10px] font-bold uppercase text-primary bg-primary/20 px-1.5 py-0.5 rounded">
            Cohort
          </span>
        )}
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Your Subscription Tier</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isCohort 
                    ? "Cohort access with full AI Operations functionality"
                    : "Upgrade or change your plan anytime"
                  }
                </p>
              </div>

              {/* Tier List */}
              <div className="p-2 max-h-96 overflow-y-auto">
                {allTiers.map((tier) => {
                  const isActive = currentTier.id === tier.id;
                  const getIcon = () => {
                    switch (tier.id) {
                      case "free": return <Gift className="w-5 h-5" />;
                      case "ai_assistant": return <Sparkles className="w-5 h-5" />;
                      case "ai_operations": return <Zap className="w-5 h-5" />;
                      case "ai_operations_full": return <Rocket className="w-5 h-5" />;
                    }
                  };
                  
                  return (
                    <button
                      key={tier.id}
                      onClick={() => {
                        if (isOwner) {
                          setTier(tier.id as UserTierId);
                        }
                        setIsOpen(false);
                      }}
                      disabled={!isOwner}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-1",
                        isActive 
                          ? "bg-primary/10 border border-primary/30" 
                          : "hover:bg-muted border border-transparent",
                        !isOwner && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
                        tier.color
                      )}>
                        {getIcon()}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{tier.displayName}</span>
                          {isActive && (
                            <span className="text-[10px] font-bold uppercase text-primary bg-primary/20 px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {tier.description}
                        </p>
                      </div>
                      <div className="text-right">
                        {tier.price !== null ? (
                          <div className="text-sm font-semibold text-foreground">
                            ${tier.price}
                            <span className="text-xs text-muted-foreground font-normal">/mo</span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">Free</span>
                        )}
                      </div>
                      {isActive && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-muted/30">
                <a 
                  href="/subscription" 
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  onClick={() => setIsOpen(false)}
                >
                  <Crown className="w-3 h-3" />
                  Manage Subscription
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
