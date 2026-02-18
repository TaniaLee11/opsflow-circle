import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { checkPageAccess, getNextTier, TIER_PRICING, type TierConfig } from '@/utils/tierLogic';
import { GlassCard } from '@/components/ui/glass-card';
import { Lock, TrendingUp, Zap } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check page access based on tier and stage
  const userConfig: TierConfig = {
    tier: profile.plan.toUpperCase() as any,
    stage: profile.stage as any,
    industry: profile.industry || 'general',
  };

  const access = checkPageAccess(location.pathname, userConfig);

  if (!access.allowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <GlassCard className="max-w-2xl w-full p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Lock className="text-primary" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Feature Locked
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {access.reason}
            </p>

            {access.upgradeRequired && (
              <div className="bg-background/60 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Upgrade to {access.upgradeRequired}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {TIER_PRICING[access.upgradeRequired].description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ${TIER_PRICING[access.upgradeRequired].monthly}
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      or ${TIER_PRICING[access.upgradeRequired].annual}/year
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = '/tier-selection'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Zap size={18} />
                  Upgrade Now
                </button>
              </div>
            )}

            {access.stageRequired && !access.upgradeRequired && (
              <div className="bg-background/60 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="text-primary" size={24} />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-foreground">
                      Complete Your Current Stage
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This feature unlocks in the "{access.stageRequired}" stage
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  View Progress
                </button>
              </div>
            )}

            <button
              onClick={() => window.history.back()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Go Back
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
