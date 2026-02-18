import { useNavigate } from "react-router-dom";
import { C, departmentColors } from "@/components/shared/theme";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Navigation } from "@/components/layout/Navigation";

export default function FinancePage() {
  const navigate = useNavigate();

  return (
    <div style={ { display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" } }>
      <Navigation />
      <main className="flex-1 p-6 lg:p-8">
        <PageHeader
          title="Finance"
          desc="Financial visibility and money management"
        />

        {/* Metrics */}
        <div style={ { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 } }>
          <MetricCard label="Monthly Revenue" value="—" />
          <MetricCard label="Expenses" value="—" />
          <MetricCard label="Cash on Hand" value="—" />
          <MetricCard label="Profit Margin" value="—" />
        </div>

        {/* Quick Actions */}
        <div style={ { marginBottom: 24 } }>
          <div style={ { color: C.text1, fontSize: 16, fontWeight: 700, marginBottom: 12 } }>Quick Actions</div>
          <div style={ { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 } }>
            <button
              onClick={() => navigate("/reconciliation")}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: 16,
                color: C.text1,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              🔄 Reconciliation
            </button>
            <button
              onClick={() => navigate("/reports")}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: 16,
                color: C.text1,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              📊 Reports
            </button>
            <button
              onClick={() => navigate("/cashflow")}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: 16,
                color: C.text1,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              💰 Cash Flow
            </button>
            <button
              onClick={() => navigate("/banking")}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: 16,
                color: C.text1,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              🏦 Banking
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div style={ { color: C.text1, fontSize: 16, fontWeight: 700, marginBottom: 12 } }>Recent Activity</div>
          <div style={ { background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 24, textAlign: "center" } }>
            <div style={ { color: C.text3, fontSize: 13 } }>No recent activity</div>
          </div>
        </div>
      </main>
    </div>
  );
}
