import { useUserTier } from "@/contexts/UserTierContext";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, Sparkles, X, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CohortBanner() {
  const { isCohort, cohortConfig } = useUserTier();
  const { isOwner } = useAuth();
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
        className="bg-gradient-to-r from-primary/20 via-primary/10 to-purple-500/20 border-b border-primary/30"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/20 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">
                AI Cohort
              </span>
            </div>
            <div className="text-sm text-foreground flex items-center gap-2">
              <span className="font-medium">90-Day Invite-Only Access</span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-400 font-medium">AI Operations</span>
              </div>
              <span className="text-muted-foreground">functionality</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Non-commercial use</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {daysRemaining !== null && (
              <div className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                <span className="text-warning font-medium">
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