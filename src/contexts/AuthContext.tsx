import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

export type UserRole = "owner" | "admin" | "operator" | "user";

export type UserType = "gig_worker" | "entrepreneur" | "nonprofit";

export type AccessType = "owner" | "cohort" | "free" | "subscription" | "one_time" | "confirmed" | "none" | "pending";

export interface User {
  id: string;
  email: string;
  name: string;
  organization?: string;
  role: UserRole;
  userType: UserType;
  avatar?: string;
  tierSelected?: boolean;
  selectedTier?: string | null;
}

export interface SubscriptionStatus {
  subscribed: boolean;
  tier: string;
  has_access: boolean;
  access_type: AccessType;
  product_id?: string | null;
  subscription_end?: string | null;
  cancel_at_period_end?: boolean;
  selected_tier?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  canAccessAIStudio: boolean;
  canCreateCourses: boolean;
  // Subscription/access state
  subscriptionStatus: SubscriptionStatus | null;
  hasAccess: boolean;
  accessType: AccessType;
  currentTier: string | null;
  isCheckingSubscription: boolean;
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUserFallback(supabaseUser: SupabaseUser): User {
  // Check localStorage for additional user data (tier selection, etc.)
  const storedData = localStorage.getItem(`vopsy_profile_${supabaseUser.id}`);
  const profileData = storedData ? JSON.parse(storedData) : {};

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
    organization: undefined,
    role: "user", // Default role, will be overwritten by backend data
    userType: "entrepreneur",
    tierSelected: profileData.tierSelected || false,
    selectedTier: profileData.selectedTier || null,
  };
}

async function buildUserFromBackend(supabaseUser: SupabaseUser): Promise<User> {
  const base = buildUserFallback(supabaseUser);

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, email, role, tier_selected, selected_tier, organization_id")
      .eq("user_id", supabaseUser.id)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", supabaseUser.id),
  ]);

  // Role detection from user_roles table only (no hardcoded emails)
  const hasOwnerRole = (roles || []).some((r) => r.role === "owner");
  const hasAdminRole = (roles || []).some((r) => r.role === "admin");
  const hasOperatorRole = (roles || []).some((r) => r.role === "operator");

  // Determine role hierarchy: owner > admin > operator > user
  let resolvedRole: UserRole = "user";
  if (hasOwnerRole) {
    resolvedRole = "owner";
  } else if (hasAdminRole) {
    resolvedRole = "admin";
  } else if (hasOperatorRole) {
    resolvedRole = "operator";
  }

  return {
    ...base,
    email: profile?.email ?? base.email,
    name: profile?.display_name ?? base.name,
    role: resolvedRole,
    tierSelected: profile?.tier_selected ?? base.tierSelected,
    selectedTier: profile?.selected_tier ?? base.selectedTier,
    organization: profile?.organization_id ? "Organization" : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  // Check subscription status
  const refreshSubscription = async () => {
    if (!session) return;

    setIsCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }

      console.log("[Auth] check-subscription result:", data);
      setSubscriptionStatus(data as SubscriptionStatus);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  useEffect(() => {
    const setUserForSession = async (session: Session | null) => {
      if (session?.user) {
        try {
          const hydrated = await buildUserFromBackend(session.user);
          setUser(hydrated);
        } catch (error) {
          console.error("[Auth] Failed to hydrate user from backend:", error);
          setUser(buildUserFallback(session.user));
        }

        // Defer subscription check to avoid deadlock
        setTimeout(() => {
          refreshSubscription();
        }, 0);
      } else {
        setUser(null);
        setSubscriptionStatus(null);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoading(true);
        setSession(session);
        setUserForSession(session).finally(() => setIsLoading(false));
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsLoading(true);
      setSession(session);
      await setUserForSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Periodically refresh subscription status (every minute)
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(() => {
      refreshSubscription();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [session]);

  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin" || isOwner;
  const canAccessAIStudio = isAdmin;
  const canCreateCourses = isAdmin;

  // Computed access properties
  const hasAccess = isOwner || (subscriptionStatus?.has_access ?? false);
  const accessType: AccessType = isOwner ? "owner" : (subscriptionStatus?.access_type ?? "none");
  const currentTier = isOwner ? "owner" : (subscriptionStatus?.tier ?? null);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
    setSession(null);
    setSubscriptionStatus(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!session,
      isOwner,
      isAdmin,
      isLoading,
      canAccessAIStudio,
      canCreateCourses,
      subscriptionStatus,
      hasAccess,
      accessType,
      currentTier,
      isCheckingSubscription,
      login,
      signup,
      loginWithGoogle,
      logout,
      refreshSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}