import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  MessageSquare, 
  Settings, 
  ChevronLeft,
  Zap,
  Bell,
  Search,
  Brain,
  GraduationCap,
  Wallet,
  FileText,
  Send,
  BarChart3,
  Workflow,
  Crown,
  LogOut,
  Shield,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  ownerOnly?: boolean;
  adminOnly?: boolean;
  category?: string;
}

const navItems: NavItem[] = [
  // Core
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", category: "Core" },
  { icon: FolderKanban, label: "Projects", href: "/projects", badge: 3, category: "Core" },
  { icon: Users, label: "Team", href: "/team", category: "Core" },
  
  // Creative
  { icon: Sparkles, label: "Studio", href: "/studio", category: "Creative" },
  
  // Financial Hub
  { icon: Wallet, label: "Financial Hub", href: "/financial", category: "Finance" },
  { icon: FileText, label: "Invoicing", href: "/invoicing", category: "Finance" },
  
  // Operations
  { icon: Send, label: "Autoresponder", href: "/autoresponder", category: "Operations" },
  { icon: BarChart3, label: "Marketing", href: "/marketing", category: "Operations" },
  { icon: Workflow, label: "Automations", href: "/automations", category: "Operations" },
  
  // Learning
  { icon: GraduationCap, label: "Academy", href: "/academy", category: "Learning" },
  
  // AI & Admin (Restricted)
  { icon: Brain, label: "AI Studio", href: "/ai-studio", adminOnly: true, category: "Admin" },
  
  // Messages
  { icon: MessageSquare, label: "Messages", href: "/messages", badge: 5, category: "Communication" },
  
  // Settings
  { icon: Settings, label: "Settings", href: "/settings", category: "System" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOwner, isAdmin, logout } = useAuth();

  const filteredItems = navItems.filter(item => {
    if (item.ownerOnly && !isOwner) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Group items by category
  const categories = [...new Set(filteredItems.map(item => item.category))];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary-sm">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="font-semibold text-foreground">Virtual OPS Hub</span>
            <span className="text-xs text-muted-foreground">Powered by VOPSy</span>
          </motion.div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-muted-foreground text-sm">
            <Search className="w-4 h-4" />
            <span>Search...</span>
            <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {categories.map(category => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;
          
          return (
            <div key={category} className="mb-4">
              {!collapsed && (
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {category}
                </p>
              )}
              {categoryItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                      />
                    )}
                    <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
                            {item.badge}
                          </span>
                        )}
                        {item.adminOnly && (
                          <Shield className="w-3.5 h-3.5 text-primary/60" />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-primary-foreground font-medium text-sm">
              {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "U"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar" />
            {isOwner && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Crown className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
                {isOwner && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary/20 text-primary">
                    OWNER
                  </span>
                )}
                {!isOwner && isAdmin && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-info/20 text-info">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{user?.organization || user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <div className="flex gap-1">
              <button className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                <Bell className="w-4 h-4 text-muted-foreground" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
      </button>
    </motion.aside>
  );
}
