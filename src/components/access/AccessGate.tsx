import { motion } from "framer-motion";
import { Loader2, Lock, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, AccessType } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AccessGateProps {
  children: React.ReactNode;
  requiredAccess?: AccessType[];
  fallback?: React.ReactNode;
}

export function AccessGate({ 
  children, 
  requiredAccess = ["owner", "cohort", "free", "subscription", "one_time", "confirmed"],
  fallback 
}: AccessGateProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    hasAccess, 
    accessType, 
    currentTier,
    subscriptionStatus,
    isCheckingSubscription 
  } = useAuth();
  const navigate = useNavigate();

  // Loading state
  if (isLoading || isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking access...</p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  // Check if user has required access type
  const hasRequiredAccess = hasAccess && requiredAccess.includes(accessType);

  if (hasRequiredAccess) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default pending access UI
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="glass rounded-2xl p-8 text-center border border-border">
          {/* Icon */}
          <div className={cn(
            "w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center",
            accessType === "pending" || accessType === "none" 
              ? "bg-warning/10 text-warning"
              : "bg-primary/10 text-primary"
          )}>
            {accessType === "pending" ? (
              <Clock className="w-8 h-8" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {accessType === "pending" ? "Payment Pending" : "Access Required"}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-6">
            {accessType === "pending" ? (
              <>
                Your selected tier <span className="font-semibold text-foreground">{subscriptionStatus?.selected_tier}</span> is 
                awaiting payment confirmation. Complete your checkout to access all features.
              </>
            ) : (
              <>
                You need an active subscription or cohort membership to access this area.
                Select a tier to get started.
              </>
            )}
          </p>

          {/* Status indicator */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className={cn(
                "px-2 py-1 rounded-lg font-medium",
                accessType === "pending" 
                  ? "bg-warning/20 text-warning"
                  : "bg-destructive/20 text-destructive"
              )}>
                {accessType === "pending" ? "Awaiting Payment" : "No Active Subscription"}
              </span>
            </div>
            {subscriptionStatus?.selected_tier && (
              <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-border">
                <span className="text-muted-foreground">Selected Tier</span>
                <span className="text-foreground font-medium">
                  {subscriptionStatus.selected_tier}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/select-tier")}
              className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors glow-primary"
            >
              {accessType === "pending" ? "Complete Checkout" : "Select a Tier"}
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-3 rounded-xl bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Help text */}
          <p className="text-xs text-muted-foreground mt-6">
            Need help? Contact support or check your email for payment confirmation.
          </p>
        </div>
      </motion.div>
    </div>
  );
}