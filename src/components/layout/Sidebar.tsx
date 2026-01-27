import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Bell,
  Search,
  Brain,
  GraduationCap,
  Wallet,
  Send,
  Workflow,
  Crown,
  LogOut,
  Shield,
  Sparkles,
  FolderLock,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import vopsLogoLight from "@/assets/vops-logo.png";
import vopsLogoDark from "@/assets/vops-logo-dark.png";

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
  // Top 3 - Always visible, no category label
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Brain, label: "VOPSy", href: "/vopsy" },
  { icon: GraduationCap, label: "Academy", href: "/academy" },
  
  // Operations section
  { icon: Send, label: "Communications", href: "/communications", category: "Operations" },
  { icon: FolderKanban, label: "Workflows", href: "/workflows", category: "Operations" },
  { icon: FolderLock, label: "Vault", href: "/vault", category: "Operations" },
  { icon: Sparkles, label: "Studio", href: "/studio", category: "Operations" },
  { icon: Wallet, label: "Financial Hub", href: "/financial", category: "Operations" },
  { icon: Workflow, label: "Automations", href: "/integrations", category: "Operations" },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOwner, isAdmin, logout } = useAuth();
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  
  // Use dark logo for dark mode, light logo for light mode
  const vopsLogo = resolvedTheme === "dark" ? vopsLogoDark : vopsLogoLight;

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


  const SidebarContent = ({ isMobileView = false }: { isMobileView?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full",
      isMobileView ? "w-full" : ""
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-6 border-b border-sidebar-border">
        <img src={vopsLogo} alt="Virtual OPS" className="h-9 sm:h-10 w-auto" />
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm sm:text-base">Virtual OPS Hub</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">Powered by VOPSy</span>
        </div>
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
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-muted-foreground text-sm">
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded hidden sm:inline">⌘K</kbd>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 sm:px-3 py-2 space-y-1 overflow-y-auto">
        {/* Top 3 items without category label */}
        <div className="mb-3 sm:mb-4">
          {filteredItems.filter(item => !item.category).map((item) => {
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
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 sm:h-6 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0", isActive && "text-primary")} />
                <span className="flex-1 text-left text-xs sm:text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-primary/20 text-primary">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Operations section */}
        <div className="mb-3 sm:mb-4">
          <p className="px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Operations
          </p>
          {filteredItems.filter(item => item.category === "Operations").map((item) => {
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
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 sm:h-6 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0", isActive && "text-primary")} />
                <span className="flex-1 text-left text-xs sm:text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-primary/20 text-primary">
                    {item.badge}
                  </span>
                )}
                {item.adminOnly && (
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary/60" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-3 sm:p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 sm:gap-3">
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
            <img src={vopsLogo} alt="Virtual OPS" className="h-8 w-auto" />
            <span className="font-semibold text-foreground">Virtual OPS Hub</span>
          </div>
        </header>
      </>
    );
  }

  // Desktop Sidebar - Static, no motion animations
  return (
    <aside
      className={cn("fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-50 flex-col hidden md:flex")}
    >
      <SidebarContent />
    </aside>
  );
}
