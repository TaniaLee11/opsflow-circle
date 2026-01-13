import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier, USER_TIERS, UserTierId } from "@/contexts/UserTierContext";
import { Navigate } from "react-router-dom";
import { 
  Settings as SettingsIcon, 
  Sparkles, 
  Users, 
  Shield, 
  Crown,
  Lock,
  Eye,
  AlertTriangle,
  CreditCard,
  Gift,
  Zap,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "subscription" | "team" | "permissions" | "general";

export default function Settings() {
  const { isAuthenticated, isOwner, isAdmin } = useAuth();
  const { currentTier, allTiers, isCohort } = useUserTier();
  const [activeTab, setActiveTab] = useState<SettingsTab>("subscription");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: "subscription" as const, label: "Subscription", icon: CreditCard, adminOnly: false },
    { id: "team" as const, label: "Team & Roles", icon: Users, adminOnly: true },
    { id: "permissions" as const, label: "Permissions", icon: Shield, adminOnly: true },
    { id: "general" as const, label: "General", icon: SettingsIcon, adminOnly: false }
  ];

  const filteredTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your subscription and platform settings</p>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">Platform Owner</span>
              </div>
            )}
          </div>
        </header>

        <div className="p-8">
          <div className="flex gap-8">
            <div className="w-64 shrink-0">
              <nav className="space-y-1">
                {filteredTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1">
              {activeTab === "subscription" && <SubscriptionSettings />}
              {activeTab === "team" && isAdmin && <TeamSettings />}
              {activeTab === "permissions" && isAdmin && <PermissionsSettings />}
              {activeTab === "general" && <GeneralSettings />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SubscriptionSettings() {
  const { currentTier, allTiers, isCohort, cohortConfig } = useUserTier();

  const getIcon = (tierId: UserTierId) => {
    switch (tierId) {
      case "free": return <Gift className="w-5 h-5" />;
      case "ai_assistant": return <Sparkles className="w-5 h-5" />;
      case "ai_operations": return <Zap className="w-5 h-5" />;
      case "ai_operations_full": return <Rocket className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Subscription Tiers</h2>
        <p className="text-muted-foreground">
          Choose the tier that fits your business needs. Enterprise enablement is available for firms only.
        </p>
      </div>

      {isCohort && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">AI Cohort Access</p>
            <p className="text-sm text-muted-foreground">
              You have full AI Operations functionality during the cohort period. Non-commercial use only.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allTiers.map((tier) => {
          const isActive = currentTier.id === tier.id;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-5 rounded-xl border transition-all",
                isActive ? "glass gradient-border glow-primary-sm" : "bg-card border-border"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white", tier.color)}>
                    {getIcon(tier.id)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{tier.displayName}</h3>
                    <p className="text-xs text-muted-foreground">{tier.price ? `$${tier.price}/mo` : "Free"}</p>
                  </div>
                </div>
                {isActive && (
                  <span className="px-2 py-1 text-xs font-bold rounded bg-primary/20 text-primary">CURRENT</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
              <div className="space-y-1">
                {tier.capabilities.slice(0, 3).map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-success" />
                    {cap}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Enterprise Enablement</p>
          <p className="text-sm text-muted-foreground">
            Enterprise is NOT a tier — it's an enablement for firms to white-label and manage clients. Contact sales for enterprise access.
          </p>
        </div>
      </div>
    </div>
  );
}

function TeamSettings() {
  const roles = [
    { role: "Owner", count: 1, description: "Full platform control", icon: Crown, color: "text-primary" },
    { role: "Admin", count: 2, description: "Manage settings and users", icon: Shield, color: "text-info" },
    { role: "Operator", count: 4, description: "Execute tasks", icon: Users, color: "text-success" },
    { role: "User", count: 12, description: "Basic access", icon: Users, color: "text-muted-foreground" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Team & Roles</h2>
        <p className="text-muted-foreground">Manage team members and access levels.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <div key={r.role} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <r.icon className={cn("w-5 h-5", r.color)} />
                <span className="font-medium text-foreground">{r.role}</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{r.count}</span>
            </div>
            <p className="text-sm text-muted-foreground">{r.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PermissionsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Permissions</h2>
        <p className="text-muted-foreground">Configure role access levels.</p>
      </div>
      <div className="glass gradient-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Permission Hierarchy</h3>
        <div className="space-y-4">
          {[
            { role: "Owner", permissions: ["Full platform control", "All tier features", "Cannot be removed"] },
            { role: "Admin", permissions: ["Manage users", "Configure settings", "View all data"] },
            { role: "Operator", permissions: ["Execute tasks", "Limited settings"] },
            { role: "User", permissions: ["Basic features", "View assigned content"] }
          ].map((item, i) => (
            <div key={item.role} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">{i + 1}</div>
              <div>
                <h4 className="font-medium text-foreground">{item.role}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.permissions.map((p) => (
                    <span key={p} className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">General Settings</h2>
        <p className="text-muted-foreground">Basic platform configuration.</p>
      </div>
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <h3 className="font-medium text-foreground mb-1">Organization</h3>
          <p className="text-sm text-muted-foreground">Virtual OPS LLC</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <h3 className="font-medium text-foreground mb-1">AI Agent</h3>
          <p className="text-sm text-muted-foreground">VOPSy — Single agent covering all business domains</p>
        </div>
      </div>
    </div>
  );
}
