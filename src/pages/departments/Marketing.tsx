import { Navigation } from '@/components/layout/Navigation';
import { C, getCardGradient, getCardBorder, cardBaseStyles } from "@/components/shared/theme";
import { PageHeader } from '@/components/shared/PageHeader';
import { Megaphone } from 'lucide-react';


export default function Marketing() {
  const userContext = {
    stage: 'foundations' as const,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-6 lg:p-8">
        <PageHeader 
          title="Marketing Department"
          subtitle="Manage your marketing operations"
          icon={Megaphone}
        />
        
        <div className="glass gradient-border rounded-xl p-6">
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
