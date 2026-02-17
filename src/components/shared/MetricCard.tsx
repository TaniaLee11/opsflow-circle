import { C } from "./theme";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  sub?: string;
}

export function MetricCard({ label, value, trend, trendUp, sub }: MetricCardProps) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div style={{ color: C.text3, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <div style={{ color: C.text1, fontSize: 24, fontWeight: 700 }}>{value}</div>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: trendUp ? C.green : C.red, fontSize: 13, fontWeight: 600 }}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </div>
        )}
      </div>
      {sub && <div style={{ color: C.text2, fontSize: 12 }}>{sub}</div>}
    </div>
  );
}
