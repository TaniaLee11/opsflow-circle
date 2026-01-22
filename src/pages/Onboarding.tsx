import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  UserTierId, 
  USER_TIERS, 
  UserIdentityType,
  USER_IDENTITY_LABELS
} from "@/contexts/UserTierContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowRight, 
  ArrowLeft,
  Rocket, 
  Zap, 
  Heart, 
  TrendingUp,
  Building2,
  Users,
  CheckCircle2,
  Loader2,
  Gift,
  Sparkles,
  Shield,
  Phone,
  MapPin,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type OnboardingStep = "identity" | "organization" | "tier" | "profile" | "complete";

interface OrganizationType {
  id: "for_profit" | "non_profit";
  label: string;
  description: string;
  icon: typeof Building2;
}

const organizationTypes: OrganizationType[] = [
  {
    id: "for_profit",
    label: "For-Profit Organization",
    description: "Business focused on revenue and growth",
    icon: Building2
  },
  {
    id: "non_profit",
    label: "Not-for-Profit Organization",
    description: "Mission-driven organization with community focus",
    icon: Heart
  }
];

const operatingIdentities: { id: UserIdentityType; label: string; description: string; icon: typeof Rocket }[] = [
  {
    id: "independent_operator",
    label: "Independent Operator",
    description: "Running operations, managing clients, and handling day-to-day workflows",
    icon: Zap
  },
  {
    id: "solopreneur",
    label: "Solopreneur",
    description: "Building and growing a business solo, wearing multiple hats",
    icon: Rocket
  },
  {
    id: "founder",
    label: "Founder",
    description: "Leading an organization, scaling operations, and building a team",
    icon: TrendingUp
  }
];

const tierOrder: UserTierId[] = ["free", "ai_assistant", "ai_operations", "ai_advisory", "ai_enterprise", "ai_compliance", "ai_tax"];

const tierIcons: Record<UserTierId, typeof Gift> = {
  free: Gift,
  ai_assistant: Sparkles,
  ai_operations: Zap,
  ai_enterprise: Building2,
  ai_advisory: TrendingUp,
  ai_tax: Shield,
  ai_compliance: Shield
};

// Tier mapping is now done server-side in the Edge Function

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    user, 
    isAuthenticated, 
    isLoading: authLoading, 
    isOwner,
    isCohort,
    isCheckingSubscription
  } = useAuth();
  
  // Cohort detection for NEW signups only (before cohort_membership is created)
  // After onboarding completes, cohort is detected from backend via isCohort flag
  const cohortFromUrl = searchParams.get("cohort") === "true";
  let cohortFromStorage = false;
  let storedInviteCode: string | null = null;
  try {
    cohortFromStorage = typeof window !== "undefined" && localStorage.getItem("vopsy_cohort_invite") === "true";
    storedInviteCode = typeof window !== "undefined" ? localStorage.getItem("vopsy_cohort_invite_code") : null;
  } catch {
    cohortFromStorage = false;
    storedInviteCode = null;
  }
  // During initial signup flow, use URL/storage detection
  // After signup completes, backend isCohort flag takes over
  const isNewCohortSignup = cohortFromUrl || cohortFromStorage;
  const cohortInviteCode = searchParams.get("code") || (cohortFromStorage ? storedInviteCode || undefined : undefined);
  
  const [step, setStep] = useState<OnboardingStep>("identity");
  const [isLoading, setIsLoading] = useState(false);
  
  // Onboarding data
  const [operatingIdentity, setOperatingIdentity] = useState<UserIdentityType | null>(null);
  const [organizationType, setOrganizationType] = useState<"for_profit" | "non_profit" | null>(null);
  // Cohort users don't select a tier - they get AI_COHORT automatically (system-assigned)
  // This is set to "ai_operations" for the UI display, but backend assigns "AI_COHORT"
  const [selectedTier, setSelectedTier] = useState<UserTierId | null>(null);
  const [profile, setProfile] = useState({
    organizationName: "",
    contactName: "",
    email: "",
    phone: "",
    location: "",
    industry: ""
  });

  // Redirect if not authenticated, or if already a cohort user (detected from backend)
  useEffect(() => {
    if (authLoading || isCheckingSubscription) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    // Owner skips onboarding
    if (isOwner) {
      navigate("/dashboard");
      return;
    }

    // CRITICAL: If backend detects active cohort membership, skip onboarding entirely
    // This handles returning cohort users on subsequent logins
    if (isCohort) {
      // Clear any lingering invite markers
      try {
        localStorage.removeItem("vopsy_cohort_invite");
        localStorage.removeItem("vopsy_cohort_invite_code");
        localStorage.removeItem("vopsy_cohort_invite_email");
      } catch {
        // ignore
      }
      navigate("/dashboard");
      return;
    }

    // Pre-fill email from user
    if (user?.email) {
      setProfile(prev => ({ ...prev, email: user.email || "", contactName: user.name || "" }));
    }
  }, [authLoading, isAuthenticated, isOwner, isCohort, isCheckingSubscription, navigate, user]);

  // Ensure cohort users (new signups) always have a tier assigned without showing tier selection
  // AI_COHORT is system-assigned - we use "ai_operations" for UI purposes during onboarding
  useEffect(() => {
    if (isNewCohortSignup && !selectedTier) {
      setSelectedTier("ai_operations");
    }
  }, [isNewCohortSignup, selectedTier]);

  // For cohort users, skip tier selection step entirely
  // AI_COHORT is NEVER selectable - it's system-assigned only
  const steps: OnboardingStep[] = isNewCohortSignup 
    ? ["identity", "organization", "profile", "complete"]
    : ["identity", "organization", "tier", "profile", "complete"];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;


  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const handleComplete = async () => {
    if (!user || !selectedTier || !organizationType || !operatingIdentity) return;

    setIsLoading(true);
    try {
      // Get the current session for auth token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session");
      }

      // Call the Edge Function to handle all server-side inserts
      // This bypasses RLS issues by using service role on the server
      // For cohort users, backend assigns AI_COHORT tier (not ai_operations)
      const { data, error } = await supabase.functions.invoke("onboard-create-org-account", {
        body: {
          organizationName: profile.organizationName,
          contactName: profile.contactName,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          industry: profile.industry,
          selectedTier,
          operatingIdentity,
          organizationType,
          isCohortUser: isNewCohortSignup, // Backend will assign AI_COHORT
          cohortInviteCode, // Pass invite code for tracking (if available)
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to complete onboarding");
      }

      if (!data?.success) {
        console.error("Onboarding failed:", data);
        throw new Error(data?.error || "Failed to create organization and account");
      }

      console.log("Onboarding completed:", data);
      
      // ALWAYS clear cohort invite markers after successful onboarding
      // From now on, cohort detection comes from backend cohort_memberships
      try {
        localStorage.removeItem("vopsy_cohort_invite");
        localStorage.removeItem("vopsy_cohort_invite_code");
        localStorage.removeItem("vopsy_cohort_invite_email");
      } catch {
        // ignore
      }
      
      // Cohort users always go to dashboard (they have full AI Operations access via AI_COHORT)
      if (isNewCohortSignup) {
        toast.success("Welcome to the AI Cohort! Your 90-day access has started.");
        navigate("/dashboard");
      } else if (selectedTier === "free") {
        toast.success("Welcome aboard! Your workspace is ready.");
        navigate("/dashboard");
      } else {
        toast.success("Welcome aboard! Let's set up your subscription.");
        navigate("/select-product");
      }
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Failed to complete setup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-border z-50">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">Setup</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Operating Identity */}
            {step === "identity" && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-12">
                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    How are you operating right now?
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    This helps us personalize your experience and guidance.
                  </p>
                </div>

                <div className="grid gap-4">
                  {operatingIdentities.map((identity) => (
                    <motion.button
                      key={identity.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setOperatingIdentity(identity.id)}
                      className={`glass rounded-xl p-6 text-left flex items-center gap-4 transition-all border-2 ${
                        operatingIdentity === identity.id
                          ? "border-primary glow-primary-sm"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        operatingIdentity === identity.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        <identity.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{identity.label}</h3>
                        <p className="text-sm text-muted-foreground">{identity.description}</p>
                      </div>
                      {operatingIdentity === identity.id && (
                        <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Organization Type */}
            {step === "organization" && (
              <motion.div
                key="organization"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-12">
                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    What type of organization are you setting up?
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    This determines compliance logic and reporting structure.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {organizationTypes.map((org) => (
                    <motion.button
                      key={org.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOrganizationType(org.id)}
                      className={`glass rounded-xl p-8 text-center transition-all border-2 ${
                        organizationType === org.id
                          ? "border-primary glow-primary-sm"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                        organizationType === org.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        <org.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{org.label}</h3>
                      <p className="text-muted-foreground">{org.description}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Tier Selection */}
            {step === "tier" && (
              <motion.div
                key="tier"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-12">
                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    Choose your level of support
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    You can always upgrade or change later as your needs evolve.
                  </p>
                </div>

                <div className="grid gap-4">
                  {tierOrder.map((tierId) => {
                    const tier = USER_TIERS[tierId];
                    const Icon = tierIcons[tierId];
                    return (
                      <motion.button
                        key={tierId}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedTier(tierId)}
                        className={`glass rounded-xl p-5 text-left flex items-center gap-4 transition-all border-2 ${
                          selectedTier === tierId
                            ? "border-primary glow-primary-sm"
                            : "border-transparent hover:border-border"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${tier.color}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">{tier.displayName}</h3>
                            {tier.includesHumanServices && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                + Human Services
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{tier.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-foreground">
                            {tier.price === null ? (tier.priceLabel || "Free") : `$${tier.price}/mo`}
                          </div>
                        </div>
                        {selectedTier === tierId && (
                          <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 4: Profile Creation */}
            {step === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-12">
                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    Let's set up your profile
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    This information helps us create your workspace.
                  </p>
                </div>

                <div className="glass rounded-xl p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="orgName" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        Organization Name
                      </Label>
                      <Input
                        id="orgName"
                        value={profile.organizationName}
                        onChange={(e) => setProfile({ ...profile, organizationName: e.target.value })}
                        placeholder="Your company or organization"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactName" className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        Primary Contact Name
                      </Label>
                      <Input
                        id="contactName"
                        value={profile.contactName}
                        onChange={(e) => setProfile({ ...profile, contactName: e.target.value })}
                        placeholder="Your full name"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="you@company.com"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="City, State"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry" className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        Industry / Mission
                      </Label>
                      <Input
                        id="industry"
                        value={profile.industry}
                        onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                        placeholder="e.g., Technology, Education, Healthcare"
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Complete */}
            {step === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-8"
                >
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </motion.div>

                <h1 className="text-3xl font-bold text-foreground mb-4">
                  You're All Set!
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                  Your workspace is ready. We'll configure your dashboards and workflows based on your selections.
                </p>

                <div className="glass rounded-xl p-6 max-w-md mx-auto mb-8 text-left">
                  <h3 className="font-semibold text-foreground mb-4">Your Setup Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operating As</span>
                      <span className="text-foreground font-medium">
                        {operatingIdentity ? USER_IDENTITY_LABELS[operatingIdentity] : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Organization Type</span>
                      <span className="text-foreground font-medium">
                        {organizationType === "for_profit" ? "For-Profit" : "Non-Profit"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selected Tier</span>
                      <span className="text-foreground font-medium">
                        {selectedTier ? USER_TIERS[selectedTier].displayName : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Organization</span>
                      <span className="text-foreground font-medium">
                        {profile.organizationName || profile.contactName || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="glow-primary text-lg px-10 h-14"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Enter Your Workspace
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer */}
      {step !== "complete" && (
        <footer className="fixed bottom-0 left-0 right-0 glass border-t border-border">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={
                (step === "identity" && !operatingIdentity) ||
                (step === "organization" && !organizationType) ||
                (step === "tier" && !selectedTier)
              }
              className="glow-primary-sm gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
