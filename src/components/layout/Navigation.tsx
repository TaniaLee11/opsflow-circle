import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, Bot, GraduationCap, 
  Megaphone, Users, DollarSign, Settings, UsersRound,
  Calendar, CheckSquare, FolderLock, ChevronDown, Lock, HelpCircle
} from 'lucide-react';

const C = {
  bg: "#0B1120",
  surface: "#111827",
  card: "#1A2332",
  border: "#1E293B",
  accent: "#0891B2",
  accentSoft: "rgba(8,145,178,0.12)",
  text1: "#F1F5F9",
  text2: "#94A3B8",
  text3: "#64748B",
};

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
    <aside style={{
      width: 220,
      height: '100vh',
      background: C.bg,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ 
        padding: '20px 16px', 
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <div style={{ color: C.text1, fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>
          VIRTUAL OPS HUB
        </div>
        <div style={{ color: C.text3, fontSize: 10, marginTop: 2 }}>
          Your AI Business Partner
        </div>
      </div>

      {/* Scrollable navigation area */}
      <nav style={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px 0',
      }}>
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
        <div style={{ 
          color: C.text3, 
          fontSize: 10, 
          fontWeight: 700, 
          letterSpacing: 0.8, 
          padding: '16px 16px 8px',
          marginTop: 8
        }}>
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
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                color: dept.locked ? C.text3 : C.text1,
                transition: 'all 0.2s',
              }}
            >
              <dept.icon size={16} />
              <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 500 }}>
                {dept.name}
              </span>
              {dept.locked && <Lock size={12} />}
              {!dept.locked && <ChevronDown 
                size={14} 
                style={{ 
                  transform: expanded.includes(dept.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }} 
              />}
            </button>

            {!dept.locked && expanded.includes(dept.id) && (
              <div style={{ paddingLeft: 42 }}>
                {dept.pages.map(page => (
                  <button
                    key={page.path}
                    onClick={() => navigate(page.path)}
                    style={{
                      width: '100%',
                      background: isActive(page.path) ? C.accentSoft : 'transparent',
                      border: 'none',
                      padding: '6px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: page.locked ? C.text3 : (isActive(page.path) ? C.accent : C.text2),
                      fontSize: 12,
                      fontWeight: 500,
                      borderRadius: 6,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
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
        <div style={{ height: 80 }} />
      </nav>

      {/* Support button at bottom */}
      <div style={{ 
        borderTop: `1px solid ${C.border}`,
        padding: '12px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => window.open('https://help.manus.im', '_blank')}
          style={{
            width: '100%',
            background: 'transparent',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            color: C.text2,
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.accentSoft;
            e.currentTarget.style.borderColor = C.accent;
            e.currentTarget.style.color = C.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.text2;
          }}
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
      style={{
        width: '100%',
        background: active ? C.accentSoft : 'transparent',
        border: 'none',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        color: active ? C.accent : C.text1,
        transition: 'all 0.2s',
      }}
    >
      <Icon size={16} />
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
    </button>
  );
}
