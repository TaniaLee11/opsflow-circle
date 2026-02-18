import { Navigation } from '@/components/layout/Navigation';
import { C, getCardGradient, getCardBorder, cardBaseStyles } from "@/components/shared/theme";
import { PageHeader } from '@/components/shared/PageHeader';
import { Settings } from 'lucide-react';


export default function Systems() {
  const userContext = {
    stage: 'foundations' as const,
  };

  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main className="p-6 lg:p-8">
        <PageHeader 
          title="Systems Department"
          subtitle="Manage your systems operations"
          icon={Settings}
        />
        
        <div className="glass gradient-border rounded-xl p-6">
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Systems Pages
          </div>
          <ul style={{ color: C.text2, fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
            <li key="0" style={{ marginBottom: 8 }}><a href="/integrations" style={{ color: C.accent, textDecoration: "none" }}>Integrations</a></li>\n            <li key="1" style={{ marginBottom: 8 }}><a href="/workflows" style={{ color: C.accent, textDecoration: "none" }}>Workflows</a></li>\n            <li key="2" style={{ marginBottom: 8 }}><a href="/calendar" style={{ color: C.accent, textDecoration: "none" }}>Calendar</a></li>\n            <li key="3" style={{ marginBottom: 8 }}><a href="/tasks" style={{ color: C.accent, textDecoration: "none" }}>Tasks</a></li>\n            <li key="4" style={{ marginBottom: 8 }}><a href="/vault" style={{ color: C.accent, textDecoration: "none" }}>Vault</a></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
