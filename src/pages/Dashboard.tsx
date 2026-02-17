import { Navigation } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { VOPSyInsight } from '@/components/shared/VOPSyInsight';
import { MetricCard } from '@/components/shared/MetricCard';
import { LayoutDashboard, TrendingUp, Users, DollarSign, CheckSquare } from 'lucide-react';

const C = {
  bg: "#0B1120",
  surface: "#111827",
  card: "#1A2332",
  border: "#1E293B",
  accent: "#0891B2",
  text1: "#F1F5F9",
  text2: "#94A3B8",
  text3: "#64748B",
};

export default function Dashboard() {
  // Mock user context - in production, get from auth
  const userContext = {
    name: 'Tania',
    stage: 'growing' as const,
    tier: 'ops' as const,
    industry: 'owner' as const,
    integrations: ['quickbooks', 'gmail', 'ghl'],
  };
  
  const isConnected = userContext.integrations.length > 0;
  
  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main style={{ padding: 32 }}>
        <PageHeader 
          title={`Welcome back, ${userContext.name}`}
          subtitle={isConnected ? 'Your business at a glance' : 'Connect your tools to see your business data here'}
          icon={LayoutDashboard}
        />
        
        <VOPSyInsight page="dashboard" userContext={userContext} />
        
        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          <MetricCard
            label="Revenue (MTD)"
            value={isConnected ? "$12,450" : "$0"}
            change={isConnected ? "+8%" : undefined}
            icon={DollarSign}
            color="#059669"
          />
          <MetricCard
            label="Active Deals"
            value={isConnected ? "14" : "0"}
            change={isConnected ? "+2" : undefined}
            icon={TrendingUp}
            color="#9333EA"
          />
          <MetricCard
            label="Contacts"
            value={isConnected ? "287" : "0"}
            change={isConnected ? "+23" : undefined}
            icon={Users}
            color="#D97706"
          />
          <MetricCard
            label="Tasks Due"
            value="0"
            icon={CheckSquare}
            color="#0891B2"
          />
        </div>
        
        {/* Quick Actions */}
        <div style={{ 
          background: C.card, 
          border: `1px solid ${C.border}`, 
          borderRadius: 12, 
          padding: 24 
        }}>
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <QuickActionButton label="Add Task" onClick={() => window.location.href = '/tasks'} />
            <QuickActionButton label="Create Event" onClick={() => window.location.href = '/calendar'} />
            <QuickActionButton label="Upload File" onClick={() => window.location.href = '/vault'} />
            <QuickActionButton label="Ask VOPSy" onClick={() => window.location.href = '/vopsy'} />
          </div>
        </div>
        
        {/* Empty state for no integrations */}
        {!isConnected && (
          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 48,
            textAlign: 'center',
            marginTop: 24
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔌</div>
            <div style={{ color: C.text1, fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              Connect your business tools
            </div>
            <div style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 24px' }}>
              Connect QuickBooks, GoHighLevel, Gmail, and other tools to see your business data here automatically.
              Or track everything manually — your choice.
            </div>
            <button
              onClick={() => window.location.href = '/integrations'}
              style={{
                background: C.accent,
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              View Integrations →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function QuickActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: '12px 16px',
        color: C.text1,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.accent;
        e.currentTarget.style.color = C.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.color = C.text1;
      }}
    >
      {label}
    </button>
  );
}
