import { Navigation } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Users } from 'lucide-react';

const C = {
  bg: "#0B1120",
  card: "#1A2332",
  border: "#1E293B",
  accent: "#0891B2",
  text1: "#F1F5F9",
  text2: "#94A3B8",
};

export default function Engagement() {
  const userContext = {
    stage: 'foundations' as const,
  };

  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main style={{ padding: 32 }}>
        <PageHeader 
          title="Engagement Department"
          subtitle="Manage your engagement operations"
          icon={Users}
        />
        
        <div style={{ 
          background: C.card, 
          border: `1px solid ${C.border}`, 
          borderRadius: 12, 
          padding: 24,
          marginTop: 24
        }}>
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Engagement Pages
          </div>
          <ul style={{ color: C.text2, fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
            <li key="0" style={{ marginBottom: 8 }}><a href="/people" style={{ color: C.accent, textDecoration: "none" }}>People</a></li>\n            <li key="1" style={{ marginBottom: 8 }}><a href="/pipeline" style={{ color: C.accent, textDecoration: "none" }}>Pipeline</a></li>\n            <li key="2" style={{ marginBottom: 8 }}><a href="/proposals--contracts" style={{ color: C.accent, textDecoration: "none" }}>Proposals & Contracts</a></li>\n            <li key="3" style={{ marginBottom: 8 }}><a href="/inbox" style={{ color: C.accent, textDecoration: "none" }}>Inbox</a></li>\n            <li key="4" style={{ marginBottom: 8 }}><a href="/follow-ups" style={{ color: C.accent, textDecoration: "none" }}>Follow-ups</a></li>\n            <li key="5" style={{ marginBottom: 8 }}><a href="/surveys" style={{ color: C.accent, textDecoration: "none" }}>Surveys</a></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
