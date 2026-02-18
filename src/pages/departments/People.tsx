import { Navigation } from '@/components/layout/Navigation';
import { C, getCardGradient, getCardBorder, cardBaseStyles } from "@/components/shared/theme";
import { PageHeader } from '@/components/shared/PageHeader';
import { UsersRound } from 'lucide-react';


export default function People() {
  const userContext = {
    stage: 'foundations' as const,
  };

  if (userContext.stage === 'foundations') {
    return (
      <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
        <Navigation />
        <main className="p-6 lg:p-8">
          <PageHeader 
            title="People Department"
            subtitle="Available in Operating and Growing stages"
            icon={UsersRound}
          />
          <div style={{
            background: getCardGradient("#DC2626"), borderRadius: 12,
            border: getCardBorder("#DC2626"),
            padding: 48, textAlign: "center"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ color: C.text1, fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              This department is locked
            </div>
            <div style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
              People becomes available when you move to the Operating stage.
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main className="p-6 lg:p-8">
        <PageHeader 
          title="People Department"
          subtitle="Manage your people operations"
          icon={UsersRound}
        />
        
        <div className="glass gradient-border rounded-xl p-6">
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            People Pages
          </div>
          <ul style={{ color: C.text2, fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
            <li key="0" style={{ marginBottom: 8 }}><a href="/team" style={{ color: C.accent, textDecoration: "none" }}>Team</a></li>\n            <li key="1" style={{ marginBottom: 8 }}><a href="/payroll" style={{ color: C.accent, textDecoration: "none" }}>Payroll</a></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
