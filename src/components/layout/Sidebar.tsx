import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  FolderLock,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  // Core - Dashboard first
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", category: "Core" },
  
  // AI Assistant - VOPSy second
  { icon: Brain, label: "VOPSy", href: "/vopsy", category: "AI Assistant" },
  
  // Workflows - Projects & Calendar
  { icon: FolderKanban, label: "Workflows", href: "/workflows", category: "Productivity" },
  
  // Documents & Storage
  { icon: FolderLock, label: "Vault", href: "/vault", category: "Documents" },
  
  // Creative - Studio for content creation and marketing
  { icon: Sparkles, label: "Studio", href: "/studio", category: "Creative" },
  
  // Learning
  { icon: GraduationCap, label: "Academy", href: "/academy", category: "Learning" },
  
  // Financial Hub
  { icon: Wallet, label: "Financial Hub", href: "/financial", category: "Finance" },
  
  // Integrations
  { icon: Workflow, label: "Automations", href: "/integrations", category: "Integrations" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOwner, isAdmin, logout } = useAuth();
  const isMobile = useIsMobile();

  const filteredItems = navItems.filter(item => {
    if (item.ownerOnly && !isOwner) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    if (isMobile) setMobileOpen(false);
  };

  // Group items by category
  const categories = [...new Set(filteredItems.map(item => item.category))];

  const SidebarContent = ({ isMobileView = false }: { isMobileView?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full",
      isMobileView ? "w-full" : ""
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-6 border-b border-sidebar-border">
        <div className="relative">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center glow-primary-sm">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
        </div>
        {(!collapsed || isMobileView) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="font-semibold text-foreground text-sm sm:text-base">Virtual OPS Hub</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Powered by VOPSy</span>
          </motion.div>
        )}
        {isMobileView && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search */}
      {(!collapsed || isMobileView) && (
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-muted-foreground text-sm">
            <Search className="w-4 h-4" />
            <span>Search...</span>
            <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded hidden sm:inline">⌘K</kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 sm:px-3 py-2 space-y-1 overflow-y-auto">
        {categories.map(category => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;
          
          return (
            <div key={category} className="mb-3 sm:mb-4">
              {(!collapsed || isMobileView) && (
                <p className="px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {category}
                </p>
              )}
              {categoryItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 group relative",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 sm:h-6 bg-primary rounded-r-full"
                      />
                    )}
                    <item.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0", isActive && "text-primary")} />
                    {(!collapsed || isMobileView) && (
                      <>
                        <span className="flex-1 text-left text-xs sm:text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-primary/20 text-primary">
                            {item.badge}
                          </span>
                        )}
                        {item.adminOnly && (
                          <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary/60" />
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
      <div className="p-3 sm:p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-2 sm:gap-3",
          (collapsed && !isMobileView) && "justify-center"
        )}>
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-primary-foreground font-medium text-xs sm:text-sm">
              {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "U"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-success rounded-full border-2 border-sidebar" />
            {isOwner && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-primary rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary-foreground" />
              </div>
            )}
          </div>
          {(!collapsed || isMobileView) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
                {isOwner && (
                  <span className="px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold rounded bg-primary/20 text-primary">
                    OWNER
                  </span>
                )}
                {!isOwner && isAdmin && (
                  <span className="px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold rounded bg-info/20 text-info">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{user?.organization || user?.email}</p>
            </div>
          )}
          {(!collapsed || isMobileView) && (
            <div className="flex gap-1">
              <button className="p-1.5 sm:p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar (Sheet)
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border h-14 flex items-center px-4 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r border-sidebar-border">
              <SidebarContent isMobileView />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Virtual OPS Hub</span>
          </div>
        </header>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-all duration-300 hidden md:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <SidebarContent />

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
