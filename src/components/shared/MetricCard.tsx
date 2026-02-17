import { C, getCardGradient, getCardBorder, getIconBackground, cardBaseStyles } from "./theme";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  accentColor?: string;
  trend?: string;
  trendUp?: boolean;
  sub?: string;
}

export function MetricCard({ label, value, icon: Icon, accentColor = C.accent, trend, trendUp, sub }: MetricCardProps) {
  return (
    <div
      style={{
        background: getCardGradient(accentColor),
        border: getCardBorder(accentColor),
        ...cardBaseStyles,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: C.text3, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {label}
        </div>
        {Icon && (
          <div
            style={{
              background: getIconBackground(accentColor),
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ color: C.text1, fontSize: 28, fontWeight: 700 }}>{value}</div>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: trendUp ? C.green : C.red, fontSize: 13, fontWeight: 600 }}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </div>
        )}
      </div>
      
      {sub && <div style={{ color: C.text2, fontSize: 13 }}>{sub}</div>}
    </div>
  );
}
