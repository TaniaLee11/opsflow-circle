import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, isOwner, isCohort, hasAccess } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - redirect to auth page
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Owner always has access - skip all onboarding checks
  if (isOwner) {
    return <>{children}</>;
  }

  // Cohort users bypass onboarding - they get automatic access
  if (isCohort) {
    return <>{children}</>;
  }

  // Regular sub-users: check if they've completed onboarding
  if (requireOnboarding) {
    // If user hasn't selected a tier yet, send to onboarding
    if (!user.tierSelected) {
      return <Navigate to="/onboarding" replace />;
    }
    
    // If user selected a tier but doesn't have access yet, send to tier selection
    if (!hasAccess) {
      return <Navigate to="/select-tier" replace />;
    }
  }

  // All checks passed - render the protected content
  return <>{children}</>;
}
