import { useUserTier } from "@/contexts/UserTierContext";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function CohortBanner() {
  const { isCohort, cohortConfig } = useUserTier();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isCohort || isDismissed) return null;

  const daysRemaining = cohortConfig?.expiresAt 
    ? Math.ceil((cohortConfig.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-primary/20 via-primary/10 to-orange-500/20 border-b border-primary/30"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/20 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">
                AI Cohort
              </span>
            </div>
            <div className="text-sm text-foreground">
              <span className="font-medium">Invite-only, temporary access</span>
              <span className="text-muted-foreground"> with full AI Operations functionality. </span>
              <span className="text-primary font-medium">Non-commercial. No enterprise permissions.</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {daysRemaining !== null && (
              <div className="flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                <span className="text-muted-foreground">
                  {daysRemaining} days remaining
                </span>
              </div>
            )}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
