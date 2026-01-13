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
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Platform owner email
const PLATFORM_OWNER_EMAIL = "tania@virtualopsassist.com";

function mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
  const isOwner = supabaseUser.email?.toLowerCase() === PLATFORM_OWNER_EMAIL.toLowerCase();
  
  // Check localStorage for additional user data (tier selection, etc.)
  const storedData = localStorage.getItem(`vopsy_profile_${supabaseUser.id}`);
  const profileData = storedData ? JSON.parse(storedData) : {};
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
    organization: isOwner ? "Virtual OPS LLC" : undefined,
    role: isOwner ? "owner" : "user",
    userType: "entrepreneur",
    tierSelected: isOwner ? true : profileData.tierSelected || false,
    selectedTier: isOwner ? null : profileData.selectedTier || undefined,
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
      
      setSubscriptionStatus(data as SubscriptionStatus);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          setUser(mapSupabaseUserToUser(session.user));
          // Defer subscription check to avoid deadlock
          setTimeout(() => {
            refreshSubscription();
          }, 0);
        } else {
          setUser(null);
          setSubscriptionStatus(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(mapSupabaseUserToUser(session.user));
        // Check subscription after session is set
        setTimeout(() => {
          refreshSubscription();
        }, 0);
      }
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