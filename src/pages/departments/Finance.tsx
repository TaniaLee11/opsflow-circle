import { Navigation } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { DollarSign } from 'lucide-react';

const C = {
  bg: "#0B1120",
  card: "#1A2332",
  border: "#1E293B",
  accent: "#0891B2",
  text1: "#F1F5F9",
  text2: "#94A3B8",
};

export default function Finance() {
  const userContext = {
    stage: 'foundations' as const,
  };

  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main style={{ padding: 32 }}>
        <PageHeader 
          title="Finance Department"
          subtitle="Manage your finance operations"
          icon={DollarSign}
        />
        
        <div style={{ 
          background: C.card, 
          border: `1px solid ${C.border}`, 
          borderRadius: 12, 
          padding: 24,
          marginTop: 24
        }}>
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Finance Pages
          </div>
          <ul style={{ color: C.text2, fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
            <li key="0" style={{ marginBottom: 8 }}><a href="/reconciliation" style={{ color: C.accent, textDecoration: "none" }}>Reconciliation</a></li>\n            <li key="1" style={{ marginBottom: 8 }}><a href="/tax-organizer" style={{ color: C.accent, textDecoration: "none" }}>Tax Organizer</a></li>\n            <li key="2" style={{ marginBottom: 8 }}><a href="/reports" style={{ color: C.accent, textDecoration: "none" }}>Reports</a></li>\n            <li key="3" style={{ marginBottom: 8 }}><a href="/cash-flow" style={{ color: C.accent, textDecoration: "none" }}>Cash Flow</a></li>\n            <li key="4" style={{ marginBottom: 8 }}><a href="/banking" style={{ color: C.accent, textDecoration: "none" }}>Banking</a></li>\n            <li key="5" style={{ marginBottom: 8 }}><a href="/funding-readiness" style={{ color: C.accent, textDecoration: "none" }}>Funding Readiness</a></li>\n            <li key="6" style={{ marginBottom: 8 }}><a href="/grants" style={{ color: C.accent, textDecoration: "none" }}>Grants</a></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
