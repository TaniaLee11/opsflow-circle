// Navigation.tsx - Complete rebuild to force Vercel deployment
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Megaphone, TrendingUp, Headset, DollarSign, Settings, Users,
  FileText, Target, Sparkles, Bell, Calendar, GitBranch, Building2,
  Handshake, FileSignature, FileCheck, UserCog, Inbox, Ticket,
  Receipt, Calculator, BarChart3, Waves, Plug, Zap, ShieldCheck,
  ChevronDown, ChevronRight
} from "lucide-react";

interface NavPage {
  label: string;
  href: string;
  icon: any;
}

interface Department {
  id: string;
  label: string;
  icon: any;
  tooltip: string;
  pages: NavPage[];
  dashboardHref?: string;
}

const departments: Department[] = [
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    tooltip: "Attraction and outbound growth",
    dashboardHref: "/marketing",
    pages: [
      { icon: FileText, label: "Social Media", href: "/social" },
      { icon: Target, label: "Campaigns", href: "/campaigns" },
      { icon: Sparkles, label: "Studio", href: "/studio" },
      { icon: TrendingUp, label: "Funnels", href: "/funnels" },
      { icon: Bell, label: "Broadcast", href: "/broadcast" },
      { icon: Users, label: "Lead Capture", href: "/leads" },
      { icon: Calendar, label: "Content Planner", href: "/content-planner" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: TrendingUp,
    tooltip: "Conversion and revenue closure",
    dashboardHref: "/sales",
    pages: [
      { icon: GitBranch, label: "Pipeline", href: "/pipeline" },
      { icon: Building2, label: "CRM", href: "/crm" },
      { icon: Handshake, label: "Deals", href: "/deals" },
      { icon: FileSignature, label: "Proposals", href: "/proposals" },
      { icon: FileCheck, label: "Contracts", href: "/contracts" },
      { icon: UserCog, label: "Client Onboarding", href: "/onboarding-workflows" },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: Headset,
    tooltip: "Post-sale relationship management",
    dashboardHref: "/support",
    pages: [
      { icon: Inbox, label: "Inbox", href: "/communications" },
      { icon: Ticket, label: "Tickets", href: "/tickets" },
      { icon: Headset, label: "Help Desk", href: "/helpdesk" },
      { icon: TrendingUp, label: "Inbound Campaigns", href: "/inbound" },
      { icon: Bell, label: "Outbound Follow-up", href: "/outbound" },
      { icon: FileText, label: "Surveys", href: "/surveys" },
      { icon: Sparkles, label: "Retention Workflows", href: "/retention" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    tooltip: "Financial visibility and money management",
    dashboardHref: "/finance",
    pages: [
      { icon: Receipt, label: "Reconciliation", href: "/reconciliation" },
      { icon: Calculator, label: "Tax Organizer", href: "/tax" },
      { icon: BarChart3, label: "Reports & Analytics", href: "/reports" },
      { icon: Waves, label: "Cash Flow", href: "/cashflow" },
      { icon: Building2, label: "Banking", href: "/banking" },
      { icon: TrendingUp, label: "Funding Readiness", href: "/funding" },
      { icon: Sparkles, label: "Donation/Grant Tracking", href: "/grants" },
    ],
  },
  {
    id: "systems",
    label: "Systems",
    icon: Settings,
    tooltip: "Automation and infrastructure",
    dashboardHref: "/systems",
    pages: [
      { icon: Plug, label: "Integrations", href: "/integrations" },
      { icon: Zap, label: "Workflows", href: "/workflows" },
      { icon: Settings, label: "API Connections", href: "/api" },
      { icon: Zap, label: "Webhooks", href: "/webhooks" },
      { icon: Sparkles, label: "AI Process Triggers", href: "/ai-triggers" },
      { icon: FileText, label: "System Logs", href: "/logs" },
    ],
  },
  {
    id: "people",
    label: "People",
    icon: Users,
    tooltip: "Internal team management",
    dashboardHref: "/people",
    pages: [
      { icon: UserCog, label: "Contractors", href: "/contractors" },
      { icon: ShieldCheck, label: "Roles & Permissions", href: "/roles" },
      { icon: DollarSign, label: "Payroll", href: "/payroll" },
      { icon: FileCheck, label: "Onboarding Documents", href: "/onboarding-docs" },
      { icon: ShieldCheck, label: "HR Compliance", href: "/hr-compliance" },
    ],
  },
];

const toolsPages: NavPage[] = [
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: FileText, label: "Tasks", href: "/tasks" },
  { icon: FileText, label: "Vault", href: "/vault" },
];

export default function Navigation() {
  const [expandedDepts, setExpandedDepts] = useState<string[]>([]);

  const toggleDept = (id: string) => {
    setExpandedDepts(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  return (
    <nav className="flex flex-col gap-2 p-4">
      {/* Top Level */}
      <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100">
        Dashboard
      </Link>
      <Link to="/vopsy" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100">
        VOPSy
      </Link>
      <Link to="/academy" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100">
        Academy
      </Link>

      {/* Departments */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-500 px-3 mb-2">DEPARTMENTS</p>
        {departments.map((dept) => (
          <div key={dept.id}>
            <button
              onClick={() => toggleDept(dept.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100"
            >
              <span className="flex items-center gap-2">
                <dept.icon className="w-4 h-4" />
                {dept.label}
              </span>
              {expandedDepts.includes(dept.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {expandedDepts.includes(dept.id) && (
              <div className="ml-6 mt-1 space-y-1">
                {dept.pages.map((page) => (
                  <Link
                    key={page.href}
                    to={page.href}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded hover:bg-gray-100"
                  >
                    <page.icon className="w-3.5 h-3.5" />
                    {page.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tools */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-500 px-3 mb-2">TOOLS</p>
        {toolsPages.map((page) => (
          <Link
            key={page.href}
            to={page.href}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
          >
            <page.icon className="w-4 h-4" />
            {page.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
