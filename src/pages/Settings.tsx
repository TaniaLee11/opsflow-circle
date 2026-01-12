import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useSubUser, AIAgentId, AI_AGENTS } from "@/contexts/SubUserContext";
import { Navigate } from "react-router-dom";
import { 
  Settings as SettingsIcon, 
  Bot, 
  Users, 
  Shield, 
  ToggleLeft, 
  ToggleRight,
  ChevronRight,
  Crown,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "agents" | "team" | "permissions" | "general";

export default function Settings() {
  const { isAuthenticated, isOwner, isAdmin, user } = useAuth();
  const { allAgents, toggleAgentEnabled } = useSubUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("agents");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: "agents" as const, label: "AI Agents", icon: Bot, adminOnly: true },
    { id: "team" as const, label: "Team & Roles", icon: Users, adminOnly: true },
    { id: "permissions" as const, label: "Permissions", icon: Shield, adminOnly: true },
    { id: "general" as const, label: "General", icon: SettingsIcon, adminOnly: false }
  ];

  const filteredTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your platform and AI agents</p>
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
            {/* Sidebar Tabs */}
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
                    {tab.adminOnly && (
                      <Shield className="w-3.5 h-3.5 ml-auto text-primary/50" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1">
              {activeTab === "agents" && isAdmin && (
                <AgentsSettings agents={allAgents} onToggle={toggleAgentEnabled} />
              )}
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

function AgentsSettings({ 
  agents, 
  onToggle 
}: { 
  agents: typeof AI_AGENTS[keyof typeof AI_AGENTS][]; 
  onToggle: (id: AIAgentId) => void;
}) {
  const [selectedAgent, setSelectedAgent] = useState<AIAgentId | null>(null);
  const agent = selectedAgent ? AI_AGENTS[selectedAgent] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">AI Agents</h2>
        <p className="text-muted-foreground">Configure which AI agents are available to users and manage their permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent List */}
        <div className="space-y-3">
          {agents.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedAgent(a.id)}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all",
                selectedAgent === a.id
                  ? "glass gradient-border glow-primary-sm"
                  : "bg-card border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg",
                    a.color
                  )}>
                    {a.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{a.name}</h3>
                    <p className="text-xs text-muted-foreground">{a.title}</p>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(a.id);
                  }}
                  className={cn(
                    "transition-colors",
                    a.enabled ? "text-success" : "text-muted-foreground"
                  )}
                >
                  {a.enabled ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Agent Details */}
        {agent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass gradient-border rounded-xl p-6 space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl",
                agent.color
              )}>
                {agent.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.title}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{agent.description}</p>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Tone & Style</h4>
              <p className="text-sm text-muted-foreground italic">"{agent.tone}"</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-success" />
                Capabilities
              </h4>
              <ul className="space-y-1">
                {agent.capabilities.map((cap, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>

            {agent.restrictions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-destructive" />
                  Restrictions
                </h4>
                <ul className="space-y-1">
                  {agent.restrictions.map((res, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      {res}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TeamSettings() {
  const roles = [
    { role: "Owner", count: 1, description: "Full platform control, non-removable", icon: Crown, color: "text-primary" },
    { role: "Admin", count: 2, description: "Manage settings, users, and AI agents", icon: Shield, color: "text-info" },
    { role: "Operator", count: 4, description: "Execute tasks and manage operations", icon: Users, color: "text-success" },
    { role: "Standard User", count: 12, description: "Basic access to assigned features", icon: Users, color: "text-muted-foreground" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Team & Roles</h2>
        <p className="text-muted-foreground">Manage team members and their access levels.</p>
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

      <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Role Management</p>
          <p className="text-sm text-muted-foreground">Full team management requires enabling Lovable Cloud for database storage.</p>
        </div>
      </div>
    </div>
  );
}

function PermissionsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Permissions</h2>
        <p className="text-muted-foreground">Configure what each role can access and modify.</p>
      </div>

      <div className="glass gradient-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Permission Hierarchy</h3>
        <div className="space-y-4">
          {[
            { role: "Owner", permissions: ["All permissions", "Platform ownership", "Cannot be removed"] },
            { role: "Admin", permissions: ["Manage users", "Configure AI agents", "Access all features", "Cannot modify owner"] },
            { role: "Operator", permissions: ["Execute tasks", "View reports", "Use AI agents", "Limited settings access"] },
            { role: "User", permissions: ["Basic features only", "View assigned content", "Interact with approved AI agents"] }
          ].map((item, i) => (
            <div key={item.role} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                {i + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{item.role}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.permissions.map((p) => (
                    <span key={p} className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                      {p}
                    </span>
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
          <h3 className="font-medium text-foreground mb-1">Platform</h3>
          <p className="text-sm text-muted-foreground">Virtual OPS Hub v1.0</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <h3 className="font-medium text-foreground mb-1">AI Intelligence</h3>
          <p className="text-sm text-muted-foreground">Powered by VOPSy</p>
        </div>
      </div>
    </div>
  );
}
