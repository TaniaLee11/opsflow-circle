import { getStaticInsight, UserContext } from '@/services/vopsy';

interface VOPSyInsightProps {
  page: string;
  userContext: UserContext;
}

export function VOPSyInsight({ page, userContext }: VOPSyInsightProps) {
  const insight = getStaticInsight(page, userContext);
  
  return (
    <div style={{
      background: "rgba(8,145,178,0.08)",
      border: "1px solid rgba(8,145,178,0.2)",
      borderRadius: 10,
      padding: "12px 16px",
      marginBottom: 20,
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
    }}>
      <span style={{ fontSize: 18, marginTop: 1 }}>🤖</span>
      <div>
        <span style={{ color: "#0891B2", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>VOPSy</span>
        <p style={{ color: "#94A3B8", fontSize: 13, margin: "3px 0 0", lineHeight: 1.5 }}>{insight}</p>
      </div>
    </div>
  );
}
