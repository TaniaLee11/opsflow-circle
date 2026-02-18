import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, Bot, GraduationCap, 
  Megaphone, Users, DollarSign, Settings, UsersRound,
  Calendar, CheckSquare, FolderLock, ChevronDown, Lock, HelpCircle
} from 'lucide-react';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState<string[]>(['marketing', 'engagement', 'finance', 'systems']);

  const toggle = (dept: string) => {
    setExpanded(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
  };

  const isActive = (path: string) => location.pathname === path;

  const departments = [
    {
      id: 'marketing',
      name: 'Marketing',
      icon: Megaphone,
      color: '#D97706',
      dashboard: '/marketing',
      pages: [
        { name: 'Campaign Results', path: '/campaigns' },
        { name: 'Audience Insights', path: '/audience' },
      ]
    },
    {
      id: 'engagement',
      name: 'Engagement',
      icon: Users,
      color: '#9333EA',
      dashboard: '/engagement',
      pages: [
        { name: 'People', path: '/people' },
        { name: 'Pipeline', path: '/pipeline' },
        { name: 'Proposals & Contracts', path: '/documents' },
        { name: 'Inbox', path: '/inbox' },
        { name: 'Follow-ups', path: '/followups' },
        { name: 'Surveys', path: '/surveys' },
      ]
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: DollarSign,
      color: '#059669',
      dashboard: '/finance',
      pages: [
        { name: 'Reconciliation', path: '/reconciliation' },
        { name: 'Tax Organizer', path: '/tax' },
        { name: 'Reports', path: '/reports' },
        { name: 'Cash Flow', path: '/cashflow' },
        { name: 'Banking', path: '/banking' },
        { name: 'Funding Readiness', path: '/funding', locked: true },
        { name: 'Grants', path: '/grants', locked: true },
      ]
    },
    {
      id: 'systems',
      name: 'Systems',
      icon: Settings,
      color: '#0891B2',
      dashboard: '/systems',
      pages: [
        { name: 'Integrations', path: '/integrations' },
        { name: 'Workflows', path: '/workflows' },
        { name: 'Calendar', path: '/calendar' },
        { name: 'Tasks', path: '/tasks' },
        { name: 'Vault', path: '/vault' },
      ]
    },
    {
      id: 'people',
      name: 'People',
      icon: UsersRound,
      color: '#E11D48',
      dashboard: '/contractors',
      locked: true,
      pages: [
        { name: 'Team', path: '/contractors' },
        { name: 'Payroll', path: '/payroll' },
      ]
    },
  ];

  return (
    <aside className="w-[220px] h-screen glass border-r border-border/50 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-border/50 flex-shrink-0">
        <div className="text-foreground text-sm font-bold tracking-wide">
          VIRTUAL OPS HUB
        </div>
        <div className="text-muted-foreground text-xs mt-0.5">
          Your AI Business Partner
        </div>
      </div>

      {/* Scrollable navigation area */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <NavLink 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={isActive('/dashboard')}
          onClick={() => navigate('/dashboard')}
        />
        <NavLink 
          icon={Bot} 
          label="VOPSy" 
          active={isActive('/vopsy')}
          onClick={() => navigate('/vopsy')}
        />
        <NavLink 
          icon={GraduationCap} 
          label="Academy" 
          active={isActive('/academy')}
          onClick={() => navigate('/academy')}
        />

        {/* Departments */}
        <div className="text-muted-foreground text-[10px] font-bold tracking-wider px-4 py-2 mt-2">
          DEPARTMENTS
        </div>

        {departments.map(dept => (
          <div key={dept.id}>
            <button
              onClick={() => {
                if (dept.locked) {
                  navigate(dept.dashboard);
                } else {
                  toggle(dept.id);
                }
              }}
              className="w-full bg-transparent border-none px-4 py-2 flex items-center gap-2.5 cursor-pointer text-foreground transition-all hover:bg-accent/10"
            >
              <dept.icon size={16} />
              <span className="flex-1 text-left text-sm font-medium">
                {dept.name}
              </span>
              {dept.locked && <Lock size={12} className="text-muted-foreground" />}
              {!dept.locked && <ChevronDown 
                size={14} 
                className="transition-transform duration-200"
                style={{ 
                  transform: expanded.includes(dept.id) ? 'rotate(180deg)' : 'rotate(0deg)'
                }} 
              />}
            </button>

            {!dept.locked && expanded.includes(dept.id) && (
              <div className="pl-[42px]">
                {dept.pages.map(page => (
                  <button
                    key={page.path}
                    onClick={() => navigate(page.path)}
                    className={`w-full border-none px-3 py-1.5 text-left cursor-pointer text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                      isActive(page.path) 
                        ? 'bg-primary/10 text-primary' 
                        : page.locked 
                        ? 'bg-transparent text-muted-foreground' 
                        : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/10'
                    }`}
                  >
                    {page.name}
                    {page.locked && <Lock size={10} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Add some bottom padding for scroll space */}
        <div className="h-20" />
      </nav>

      {/* Support button at bottom */}
      <div className="border-t border-border/50 p-3 flex-shrink-0">
        <button
          onClick={() => window.open('https://help.manus.im', '_blank')}
          className="w-full bg-transparent border border-border rounded-lg px-3 py-2.5 flex items-center gap-2.5 cursor-pointer text-muted-foreground text-sm font-medium transition-all hover:bg-primary/10 hover:border-primary hover:text-primary"
        >
          <HelpCircle size={16} />
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
}

function NavLink({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full border-none px-4 py-2 flex items-center gap-2.5 cursor-pointer transition-all ${
        active 
          ? 'bg-primary/10 text-primary' 
          : 'bg-transparent text-foreground hover:bg-accent/10'
      }`}
    >
      <Icon size={16} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
