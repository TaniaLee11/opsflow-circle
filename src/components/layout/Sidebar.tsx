import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Bell,
  Search,
  Brain,
  GraduationCap,
  LogOut,
  Crown,
  Shield,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  // Department icons
  Megaphone,
  TrendingUp,
  Headset,
  DollarSign,
  Settings,
  Users,
  // Tools icons
  Calendar,
  CheckSquare,
  FolderLock,
  // Page icons - Marketing
  Sparkles,
  Target,
  FileText,
  // Page icons - Sales
  GitBranch,
  Building2,
  Handshake,
  FileSignature,
  FileCheck,
  // Page icons - Support
  Inbox,
  Ticket,
  // Page icons - Finance
  Wallet,
  Receipt,
  Calculator,
  BarChart3,
  Waves,
  // Page icons - Systems
  Zap,
  Plug,
  // Page icons - People
  UserCog,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import vopsLogoLight from "@/assets/vops-logo.png";
import vopsLogoDark from "@/assets/vops-logo-dark.png";

interface NavPage {
  icon: React.ElementType;
  label: string;
  href: string;
  ownerOnly?: boolean;
  adminOnly?: boolean;
}

interface Department {
  id: string;
  icon: React.ElementType;
  label: string;
  tooltip: string;
  pages: NavPage[];
  dashboardHref?: string;
}

const departments: Department[] = [
  {
    id: "marketing",
    icon: Megaphone,
    label: "Marketing",
    tooltip: "Attract and grow your audience.",
    dashboardHref: "/marketing",
    pages: [
      { icon: FileText, label: "Social Media", href: "/social" },
      { icon: Target, label: "Campaigns", href: "/campaigns" },
      { icon: Sparkles, label: "Studio", href: "/studio" },
    ],
  },
  {
    id: "sales",
    icon: TrendingUp,
    label: "Sales",
    tooltip: "Convert leads into revenue.",
    dashboardHref: "/sales",
    pages: [
      { icon: GitBranch, label: "Pipeline", href: "/pipeline" },
      { icon: Building2, label: "CRM", href: "/crm" },
      { icon: Handshake, label: "Deals", href: "/deals" },
      { icon: FileSignature, label: "Proposals", href: "/proposals" },
      { icon: FileCheck, label: "Contracts", href: "/contracts" },
    ],
  },
  {
    id: "support",
    icon: Headset,
    label: "Support",
    tooltip: "Manage client relationships and service.",
    dashboardHref: "/support",
    pages: [
      { icon: Inbox, label: "Inbox", href: "/inbox" },
      { icon: Ticket, label: "Tickets", href: "/tickets" },
    ],
  },
  {
    id: "finance",
    icon: DollarSign,
    label: "Finance",
    tooltip: "Track and manage business finances.",
    dashboardHref: "/finance",
    pages: [
      { icon: Receipt, label: "Reconciliation", href: "/reconciliation" },
      { icon: Calculator, label: "Tax Organizer", href: "/tax" },
      { icon: BarChart3, label: "Reports & Analytics", href: "/reports" },
      { icon: Waves, label: "Cash Flow", href: "/cashflow" },
    ],
  },
  {
    id: "systems",
    icon: Settings,
    label: "Systems",
    tooltip: "Automate and connect your tools.",
    dashboardHref: "/systems",
    pages: [
      { icon: Plug, label: "Integrations", href: "/integrations" },
      { icon: Zap, label: "Workflows", href: "/workflows" },
    ],
  },
  {
    id: "people",
    icon: Users,
    label: "People",
    tooltip: "Manage your team and roles.",
    dashboardHref: "/people",
    pages: [
      { icon: UserCog, label: "Contractors", href: "/contractors" },
      { icon: ShieldCheck, label: "Roles & Permissions", href: "/roles" },
    ],
  },
];

const toolsPages: NavPage[] = [
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: FolderLock, label: "Vault", href: "/vault" },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>(["marketing", "sales", "support", "finance", "systems", "people"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOwner, isAdmin, logout } = useAuth();
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  
  const vopsLogo = resolvedTheme === "dark" ? vopsLogoDark : vopsLogoLight;

  const toggleDepartment = (departmentId: string) => {
    setExpandedDepartments(prev => 
      prev.includes(departmentId) 
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

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
          <span className="text-[10px] sm:text-xs text-muted-foreground">Human-Led AI</span>
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
        {/* Top 3 items */}
        <div className="mb-3 sm:mb-4">
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Brain, label: "VOPSy", href: "/vopsy", subtitle: "AI Director" },
            { icon: GraduationCap, label: "Academy", href: "/academy" },
          ].map((item) => {
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
                <div className="flex-1 text-left">
                  <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                  {'subtitle' in item && (
                    <span className="block text-[10px] text-muted-foreground">{item.subtitle}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-3 sm:my-4" />

        {/* Departments Section */}
        <div className="mb-3 sm:mb-4">
          <p className="px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Departments
          </p>
          
          <div className="space-y-0.5 mt-2">
            {departments.map((dept) => {
              const isExpanded = expandedDepartments.includes(dept.id);
              const isDeptActive = location.pathname === dept.dashboardHref;
              
              return (
                <div key={dept.id}>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => toggleDepartment(dept.id)}
                          className={cn(
                            "w-full flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                            isDeptActive
                              ? "bg-primary/10 text-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <dept.icon className="w-4 h-4 shrink-0" />
                          <span className="text-xs sm:text-sm font-medium flex-1 text-left">{dept.label}</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 transition-transform" />
                          ) : (
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 transition-transform" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="hidden lg:block">
                        <p>{dept.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Department Pages */}
                  {isExpanded && (
                    <div className="ml-4 sm:ml-6 mt-1 space-y-0.5 border-l border-border/50 pl-2 sm:pl-3">
                      {dept.pages.map((page) => {
                        if (page.ownerOnly && !isOwner) return null;
                        if (page.adminOnly && !isAdmin && !isOwner) return null;
                        
                        const isPageActive = location.pathname === page.href;
                        
                        return (
                          <button
                            key={page.href}
                            onClick={() => handleNavigation(page.href)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left group",
                              isPageActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <page.icon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="text-xs sm:text-sm">{page.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-3 sm:my-4" />

        {/* Tools Section */}
        <div>
          <p className="px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tools
          </p>
          
          <div className="space-y-0.5 mt-2">
            {toolsPages.map((tool) => {
              const isActive = location.pathname === tool.href;
              
              return (
                <button
                  key={tool.href}
                  onClick={() => handleNavigation(tool.href)}
                  className={cn(
                    "w-full flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <tool.icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-foreground truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          {(isOwner || isAdmin) && (
            <div className="shrink-0">
              {isOwner ? (
                <Crown className="w-4 h-4 text-yellow-500" />
              ) : (
                <Shield className="w-4 h-4 text-blue-500" />
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border shadow-lg lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px]">
            <SidebarContent isMobileView={true} />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-sidebar border-r border-sidebar-border flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
