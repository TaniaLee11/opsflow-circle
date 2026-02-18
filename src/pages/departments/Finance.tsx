import { Navigation } from '@/components/layout/Navigation';
import { C, getCardGradient, getCardBorder, cardBaseStyles } from "@/components/shared/theme";
import { PageHeader } from '@/components/shared/PageHeader';
import { DollarSign } from 'lucide-react';


export default function Finance() {
  const userContext = {
    stage: 'foundations' as const,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-6 lg:p-8">
        <PageHeader 
          title="Finance Department"
          subtitle="Manage your finance operations"
          icon={DollarSign}
        />
        
        <div className="glass gradient-border rounded-xl p-6">
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
