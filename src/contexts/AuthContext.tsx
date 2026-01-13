import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

export type UserRole = "owner" | "admin" | "operator" | "user";

export type UserType = "gig_worker" | "entrepreneur" | "nonprofit";

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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  canAccessAIStudio: boolean;
  canCreateCourses: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          setUser(mapSupabaseUserToUser(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(mapSupabaseUserToUser(session.user));
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin" || isOwner;
  const canAccessAIStudio = isAdmin;
  const canCreateCourses = isAdmin;

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
  };

  // Helper function to update user profile data (tier selection, etc.)
  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Store profile data in localStorage keyed by user ID
    const profileData = {
      tierSelected: updatedUser.tierSelected,
      selectedTier: updatedUser.selectedTier,
    };
    localStorage.setItem(`vopsy_profile_${user.id}`, JSON.stringify(profileData));
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
      login,
      signup,
      logout,
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
