import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, Mail, Lock, User, Zap, AlertCircle, Loader2, Users } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "signin" | "signup";

interface InviteData {
  email: string;
  inviteCode: string;
  valid: boolean;
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [inviteChecking, setInviteChecking] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, isAuthenticated, user, isLoading: authLoading, isOwner } = useAuth();

  // Check for invite code and force logout if present
  useEffect(() => {
    const inviteCode = searchParams.get("invite");
    
    if (inviteCode) {
      setInviteChecking(true);
      
      // Force logout any existing session when invite link is clicked
      const handleInviteFlow = async () => {
        // Sign out current user silently
        await supabase.auth.signOut();
        
        // Validate invite code via edge function (bypasses RLS)
        const { data, error } = await supabase.functions.invoke("validate-invite", {
          body: { inviteCode }
        });
        
        if (error || !data?.valid) {
          setError(data?.error || "Invalid invite code. Please check your invite link.");
          setInviteChecking(false);
          return;
        }
        
        // Valid invite - pre-fill email and switch to signup
        setInviteData({
          email: data.email,
          inviteCode: data.inviteCode,
          valid: true,
        });
        setEmail(data.email);
        setMode("signup");
        setInviteChecking(false);
      };
      
      handleInviteFlow();
    }
  }, [searchParams]);

  // Redirect if already authenticated (but NOT during invite flow)
  useEffect(() => {
    const inviteCode = searchParams.get("invite");
    
    // Skip auto-redirect if we're handling an invite
    if (inviteCode || inviteChecking) {
      return;
    }
    
    if (!authLoading && isAuthenticated && user) {
      // Owner goes directly to dashboard
      if (isOwner) {
        navigate("/dashboard");
        return;
      }
      // Check if user needs onboarding (no tier selected)
      if (!user.tierSelected) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, authLoading, isOwner, navigate, searchParams, inviteChecking]);

  // Check for mode from URL params (only if not invite flow)
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    const inviteCode = searchParams.get("invite");
    
    if (!inviteCode && modeParam === "signup") {
      setMode("signup");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signin") {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError("Please enter your name");
          setIsLoading(false);
          return;
        }
        await signup(email, password, name);
        
        // If this was an invite signup, mark invite as accepted
        if (inviteData?.valid && inviteData.inviteCode) {
          await supabase
            .from("cohort_invites")
            .update({ 
              status: "accepted",
              accepted_at: new Date().toISOString()
            })
            .eq("invite_code", inviteData.inviteCode);
        }
      }
      // Navigation will be handled by the useEffect
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading while checking auth state or invite
  if (authLoading || inviteChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          {inviteChecking && (
            <p className="text-sm text-muted-foreground">Validating invite...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4 sm:px-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-6 sm:mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 mb-4 sm:mb-6 glow-primary"
          >
            {inviteData?.valid ? (
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            ) : (
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            )}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
          >
            {inviteData?.valid ? "Join the AI Cohort" : "Virtual OPS Hub"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4"
          >
            {inviteData?.valid ? (
              <>You've been invited to the <span className="text-primary font-medium">90-day AI Operations</span> program</>
            ) : (
              <>Powered by <span className="text-primary font-medium">VOPSy</span> — Your AI Operations Intelligence</>
            )}
          </motion.p>
          
          {!inviteData?.valid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4"
            >
              <button
                onClick={() => { setMode("signin"); setError(""); }}
                className={`text-sm font-medium transition-colors ${
                  mode === "signin" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <span className="text-muted-foreground/50">|</span>
              <button
                onClick={() => { setMode("signup"); setError(""); }}
                className={`text-sm font-medium transition-colors ${
                  mode === "signup" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </motion.div>
          )}
        </div>

        {/* Invite Badge */}
        {inviteData?.valid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-center"
          >
            <p className="text-sm text-primary font-medium">
              🎉 Create your account to get started
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your email: <span className="font-mono">{inviteData.email}</span>
            </p>
          </motion.div>
        )}

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass gradient-border rounded-xl sm:rounded-2xl p-5 sm:p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-destructive/10 text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  readOnly={inviteData?.valid}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground outline-none transition-all ${
                    inviteData?.valid ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              {inviteData?.valid && (
                <p className="text-xs text-muted-foreground mt-1">
                  Email is locked to your invite
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground outline-none transition-all"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 glow-primary hover:bg-primary/90 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{mode === "signin" ? "Signing in..." : "Creating account..."}</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>{inviteData?.valid ? "Join Cohort" : mode === "signin" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {mode === "signin" && !inviteData?.valid && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot your credentials?
            </motion.button>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          {inviteData?.valid 
            ? "Your 90-day access starts when you create your account."
            : "Platform access restricted to active operational partners."
          }
        </motion.p>
      </motion.div>
    </div>
  );
}