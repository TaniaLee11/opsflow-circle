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
  tierSelected?: boolean;
  selectedTier?: string | null;
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

// Platform owner configuration - OWNER DOES NOT NEED A TIER
const PLATFORM_OWNER = {
  email: "tania@virtualopsassist.com",
  password: "Anointed1!",
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
    // Check for owner login
    const isOwnerLogin = email.toLowerCase() === PLATFORM_OWNER.email.toLowerCase();
    
    // For owner, verify password
    if (isOwnerLogin && password !== PLATFORM_OWNER.password) {
      throw new Error("Invalid credentials");
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: isOwnerLogin ? PLATFORM_OWNER.name : email.split("@")[0],
      organization: isOwnerLogin ? PLATFORM_OWNER.organization : undefined,
      role: isOwnerLogin ? "owner" : "user",
      userType: "entrepreneur",
      tierSelected: isOwnerLogin ? true : false, // Owner doesn't need tier selection
      selectedTier: isOwnerLogin ? null : undefined // Owner has no tier
    };

    setUser(newUser);
    localStorage.setItem("vopsy_user", JSON.stringify(newUser));
  };

  const signup = async (email: string, password: string, name: string) => {
    // Block owner email from signing up (must use login)
    if (email.toLowerCase() === PLATFORM_OWNER.email.toLowerCase()) {
      throw new Error("This email is reserved. Please use login.");
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role: "user",
      userType: "entrepreneur",
      tierSelected: false,
      selectedTier: undefined
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
