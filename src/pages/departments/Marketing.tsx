import { Navigation } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Megaphone } from 'lucide-react';

const C = {
  bg: "#0B1120",
  card: "#1A2332",
  border: "#1E293B",
  accent: "#0891B2",
  text1: "#F1F5F9",
  text2: "#94A3B8",
};

export default function Marketing() {
  const userContext = {
    stage: 'foundations' as const,
  };

  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main style={{ padding: 32 }}>
        <PageHeader 
          title="Marketing Department"
          subtitle="Manage your marketing operations"
          icon={Megaphone}
        />
        
        <div style={{ 
          background: C.card, 
          border: `1px solid ${C.border}`, 
          borderRadius: 12, 
          padding: 24,
          marginTop: 24
        }}>
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Marketing Pages
          </div>
          <ul style={{ color: C.text2, fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
            <li key="0" style={{ marginBottom: 8 }}><a href="/campaign-results" style={{ color: C.accent, textDecoration: "none" }}>Campaign Results</a></li>\n            <li key="1" style={{ marginBottom: 8 }}><a href="/audience-insights" style={{ color: C.accent, textDecoration: "none" }}>Audience Insights</a></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
