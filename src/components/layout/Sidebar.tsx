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
  Workflow as WorkflowIcon,
  FileText,
  Send,
  UserPlus,
  // Page icons - Sales
  GitBranch,
  Building2,
  Handshake,
  FileSignature,
  FileCheck,
  UserCheck,
  // Page icons - Support
  Inbox,
  HelpCircle,
  Ticket,
  BarChart3,
  Radio,
  MessageSquare,
  ClipboardList,
  Heart,
  // Page icons - Finance
  Wallet,
  Landmark,
  TrendingUp as TrendingUpAlt,
  Receipt,
  Waves,
  Calculator,
  CreditCard,
  PiggyBank,
  Gift,
  // Page icons - Systems
  Zap,
  Plug,
  Code,
  Webhook,
  Bot,
  ScrollText,
  // Page icons - People
  UserCog,
  Banknote,
  ShieldCheck,
  FilePlus,
  ClipboardCheck,
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
      { icon: Sparkles, label: "Studio", href: "/studio" },
      { icon: Target, label: "Campaign Builder", href: "/campaigns" },
      { icon: WorkflowIcon, label: "Funnels", href: "/funnels" },
      { icon: FileText, label: "Content Planner", href: "/content" },
      { icon: Send, label: "Broadcast Communications", href: "/communications" },
      { icon: UserPlus, label: "Lead Management", href: "/leads" },
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
      { icon: UserCheck, label: "Client Onboarding", href: "/client-onboarding" },
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
      { icon: HelpCircle, label: "Help Desk", href: "/help-desk" },
      { icon: Ticket, label: "Ticketing", href: "/ticketing" },
      { icon: BarChart3, label: "HGO Dashboard", href: "/hgo" },
      { icon: Radio, label: "Inbound Campaigns", href: "/inbound-campaigns" },
      { icon: MessageSquare, label: "Outbound Follow-up", href: "/outbound-followup" },
      { icon: ClipboardList, label: "Surveys", href: "/surveys" },
      { icon: Heart, label: "Retention Workflows", href: "/retention" },
    ],
  },
  {
    id: "finance",
    icon: DollarSign,
    label: "Finance",
    tooltip: "Track and manage business finances.",
    dashboardHref: "/finance",
    pages: [
      { icon: Wallet, label: "Finance Hub", href: "/financial" },
      { icon: Landmark, label: "Banking", href: "/banking" },
      { icon: TrendingUpAlt, label: "Revenue Tracker", href: "/revenue" },
      { icon: Receipt, label: "Expense Tracking", href: "/expenses" },
      { icon: Waves, label: "Cash Flow", href: "/cashflow" },
      { icon: Calculator, label: "Tax Organizer", href: "/tax" },
      { icon: CreditCard, label: "Invoicing", href: "/invoicing" },
      { icon: PiggyBank, label: "Funding Readiness", href: "/funding" },
      { icon: Gift, label: "Donation Tracking", href: "/donations" },
    ],
  },
  {
    id: "systems",
    icon: Settings,
    label: "Systems",
    tooltip: "Automate and connect your tools.",
    dashboardHref: "/systems",
    pages: [
      { icon: Zap, label: "Workflow Builder", href: "/workflows" },
      { icon: Plug, label: "Integrations", href: "/integrations" },
      { icon: Code, label: "API Connections", href: "/api-connections" },
      { icon: Webhook, label: "Webhooks", href: "/webhooks" },
      { icon: Bot, label: "AI Process Triggers", href: "/ai-triggers" },
      { icon: ScrollText, label: "System Logs", href: "/system-logs" },
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
      { icon: Banknote, label: "Payroll", href: "/payroll" },
      { icon: ShieldCheck, label: "Roles & Permissions", href: "/roles" },
      { icon: FilePlus, label: "Onboarding Documents", href: "/onboarding-docs" },
      { icon: ClipboardCheck, label: "HR Compliance", href: "/hr-compliance" },
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
          
          <TooltipProvider>
            {departments.map((dept) => {
              const isExpanded = expandedDepartments.includes(dept.id);
              const isDeptActive = dept.pages.some(page => location.pathname === page.href) || 
                                   location.pathname === dept.dashboardHref;
              
              return (
                <div key={dept.id} className="mb-1">
                  {/* Department Header */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleDepartment(dept.id)}
                        className={cn(
                          "w-full flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 group",
                          isDeptActive
                            ? "bg-primary/5 text-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <dept.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0", isDeptActive && "text-primary")} />
                        <span className="flex-1 text-left text-xs sm:text-sm font-medium">{dept.label}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{dept.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Department Pages */}
                  {isExpanded && (
                    <div className="ml-4 sm:ml-6 mt-1 space-y-0.5">
                      {dept.pages.map((page) => {
                        const isActive = location.pathname === page.href;
                        const canAccess = (!page.ownerOnly || isOwner) && (!page.adminOnly || isAdmin);
                        
                        if (!canAccess) return null;

                        return (
                          <button
                            key={page.href}
                            onClick={() => handleNavigation(page.href)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 group relative",
                              isActive 
                                ? "bg-primary/10 text-primary" 
                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full" />
                            )}
                            <page.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0", isActive && "text-primary")} />
                            <span className="flex-1 text-left text-[11px] sm:text-xs">{page.label}</span>
                            {page.adminOnly && (
                              <Shield className="w-3 h-3 text-primary/60" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </TooltipProvider>
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-3 sm:my-4" />

        {/* Tools Section */}
        <div className="mb-3 sm:mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-help">
                Tools
              </p>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Shared workspace utilities.</p>
            </TooltipContent>
          </Tooltip>
          
          {toolsPages.map((tool) => {
            const isActive = location.pathname === tool.href;
            return (
              <button
                key={tool.href}
                onClick={() => handleNavigation(tool.href)}
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
                <tool.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0", isActive && "text-primary")} />
                <span className="flex-1 text-left text-xs sm:text-sm font-medium">{tool.label}</span>
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

  // Desktop Sidebar
  return (
    <aside
      className={cn("fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-50 flex-col hidden md:flex")}
    >
      <SidebarContent />
    </aside>
  );
}
