import { Navigation } from '@/components/layout/Navigation';
import { C, getCardGradient, getCardBorder, cardBaseStyles } from "@/components/shared/theme";
import { PageHeader } from '@/components/shared/PageHeader';
import { Users } from 'lucide-react';


export default function Engagement() {
  const userContext = {
    stage: 'foundations' as const,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-6 lg:p-8">
        <PageHeader 
          title="Engagement Department"
          subtitle="Manage your engagement operations"
          icon={Users}
        />
        
        <div className="glass gradient-border rounded-xl p-6">
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
