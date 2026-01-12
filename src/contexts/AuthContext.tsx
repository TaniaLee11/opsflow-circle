import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  canAccessAIStudio: boolean;
  canCreateCourses: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Platform owner configuration
const PLATFORM_OWNER = {
  email: "tania@virtualops.com",
  name: "Tania Potter",
  organization: "Virtual OPS LLC"
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem("vopsy_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin" || isOwner;
  const canAccessAIStudio = isAdmin;
  const canCreateCourses = isAdmin;

  const login = async (email: string, password: string) => {
    // Demo login - in production, this would call Supabase
    const isOwnerLogin = email.toLowerCase() === PLATFORM_OWNER.email.toLowerCase();
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: isOwnerLogin ? PLATFORM_OWNER.name : email.split("@")[0],
      organization: isOwnerLogin ? PLATFORM_OWNER.organization : undefined,
      role: isOwnerLogin ? "owner" : "user",
      userType: "entrepreneur" // Default, would be set during onboarding
    };

    setUser(newUser);
    localStorage.setItem("vopsy_user", JSON.stringify(newUser));
  };

  const signup = async (email: string, password: string, name: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role: "user",
      userType: "entrepreneur"
    };

    setUser(newUser);
    localStorage.setItem("vopsy_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vopsy_user");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isOwner,
      isAdmin,
      canAccessAIStudio,
      canCreateCourses,
      login,
      signup,
      logout
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
