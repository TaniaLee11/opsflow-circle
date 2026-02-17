import { useNavigate } from "react-router-dom";
import { C, departmentColors } from "@/components/shared/theme";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Badge } from "@/components/shared/Badge";
import { Navigation } from "@/components/layout/Navigation";

export default function ClientCare() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation />
      <main className="p-6 lg:p-8">
        <PageHeader
          title="Client Care"
          desc="Post-sale relationship management and client success"
        />

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Open Tickets" value="—" />
          <MetricCard label="Avg Response Time" value="—" />
          <MetricCard label="NPS Score" value="—" />
          <MetricCard label="Active Follow-ups" value="—" />
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Quick Actions</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/inbox")}
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
              📬 View Inbox
            </button>
            <button
              onClick={() => navigate("/followups")}
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
              📋 Manage Follow-ups
            </button>
            <button
              onClick={() => navigate("/surveys")}
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
              📊 Create Survey
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recent Activity</div>
          <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 24, textAlign: "center" }}>
            <div style={{ color: C.text3, fontSize: 13 }}>No recent activity</div>
          </div>
        </div>
      </main>
    </div>
  );
}
