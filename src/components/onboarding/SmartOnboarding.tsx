import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Crown, UserCog, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProfile {
  type: "owner" | "contractor" | "nonprofit";
  hasContractors: boolean;
  hasEmployees: boolean;
  hasActiveClients: boolean;
  hasMarketingCampaigns: boolean;
  needsFinancialTracking: boolean;
  needsAutomation: boolean;
  needsClientSupport: boolean;
  needsTeamManagement: boolean;
}

interface SmartOnboardingProps {
  onComplete: (profile: OnboardingProfile) => void;
}

export function SmartOnboarding({ onComplete }: SmartOnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<OnboardingProfile>({
    type: "owner",
    hasContractors: false,
    hasEmployees: false,
    hasActiveClients: false,
    hasMarketingCampaigns: false,
    needsFinancialTracking: false,
    needsAutomation: false,
    needsClientSupport: false,
    needsTeamManagement: false,
  });

  const profileTypes = [
    {
      id: "owner" as const,
      icon: Crown,
      title: "Owner",
      description: "Building and running your own business",
    },
    {
      id: "contractor" as const,
      icon: UserCog,
      title: "Contractor",
      description: "Managing client projects and operations",
    },
    {
      id: "nonprofit" as const,
      icon: Heart,
      title: "Nonprofit Leader",
      description: "Leading a mission-driven organization",
    },
  ];

  const currentlyHave = [
    { id: "hasContractors", label: "Contractors" },
    { id: "hasEmployees", label: "Employees" },
    { id: "hasActiveClients", label: "Active clients" },
    { id: "hasMarketingCampaigns", label: "Marketing campaigns running" },
  ];

  const needHelpWith = [
    { id: "needsFinancialTracking", label: "Financial tracking" },
    { id: "needsAutomation", label: "Automation" },
    { id: "needsClientSupport", label: "Client support tools" },
    { id: "needsTeamManagement", label: "Team management" },
  ];

  const handleProfileTypeSelect = (type: "owner" | "contractor" | "nonprofit") => {
    setProfile({ ...profile, type });
    setStep(2);
  };

  const handleCheckboxChange = (field: keyof OnboardingProfile, checked: boolean) => {
    setProfile({ ...profile, [field]: checked });
  };

  const handleNext = () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-1 rounded-full transition-colors",
                    i <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && "Welcome to Virtual OPS Hub"}
            {step === 2 && "What do you currently have?"}
            {step === 3 && "What do you need help with?"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "We're setting up YOUR operating system. Let's personalize it for you."}
            {step === 2 && "Select all that apply — this helps us configure your workspace."}
            {step === 3 && "We'll enable the departments and tools you need most."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Profile Type */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">What best describes you?</p>
              <div className="grid gap-3">
                {profileTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleProfileTypeSelect(type.id)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left",
                      profile.type === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <type.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{type.title}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Currently Have */}
          {step === 2 && (
            <div className="space-y-4">
              {currentlyHave.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
                  <Checkbox
                    id={item.id}
                    checked={profile[item.id as keyof OnboardingProfile] as boolean}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(item.id as keyof OnboardingProfile, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={item.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Need Help With */}
          {step === 3 && (
            <div className="space-y-4">
              {needHelpWith.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
                  <Checkbox
                    id={item.id}
                    checked={profile[item.id as keyof OnboardingProfile] as boolean}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(item.id as keyof OnboardingProfile, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={item.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {step > 1 && (
              <Button onClick={handleNext} className="flex-1">
                {step === 3 ? "Complete Setup" : "Next"}
              </Button>
            )}
          </div>

          {/* Human-Led AI Message */}
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              <strong className="text-foreground">Human-Led AI:</strong> You're building your command center. VOPSy will be configured to serve you — operating under your authority, within your boundaries. You remain in control.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to determine which departments to enable based on profile
export function getDepartmentVisibility(profile: OnboardingProfile): {
  marketing: boolean;
  sales: boolean;
  support: boolean;
  finance: boolean;
  systems: boolean;
  people: boolean;
} {
  const visibility = {
    marketing: false,
    sales: false,
    support: false,
    finance: false,
    systems: false,
    people: false,
  };

  switch (profile.type) {
    case "owner":
      visibility.marketing = true;
      visibility.sales = true;
      visibility.finance = true;
      visibility.systems = true;
      
      // Conditional enables
      if (profile.hasContractors || profile.hasEmployees || profile.needsTeamManagement) {
        visibility.people = true;
      }
      if (profile.hasActiveClients || profile.needsClientSupport) {
        visibility.support = true;
      }
      break;

    case "contractor":
      // Enable ALL departments for contractors
      visibility.marketing = true;
      visibility.sales = true;
      visibility.support = true;
      visibility.finance = true;
      visibility.systems = true;
      visibility.people = true;
      break;

    case "nonprofit":
      visibility.marketing = true;
      visibility.support = true;
      visibility.finance = true; // with grant/donation tracking mode
      visibility.people = true;
      visibility.systems = true;
      // Sales hidden initially for nonprofits
      break;
  }

  return visibility;
}
