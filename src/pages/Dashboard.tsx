import { useNavigate } from "react-router-dom";
import { C } from "@/components/shared/theme";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Navigation } from "@/components/layout/Navigation";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation />
      <main style={{ marginLeft: 220, flex: 1, overflowY: "auto", padding: 32 }}>
        <PageHeader
          title="Dashboard"
          desc="Your operations overview"
        />

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <MetricCard label="Active Projects" value="0" />
          <MetricCard label="Pending Tasks" value="0" />
          <MetricCard label="Completed This Week" value="0" />
          <MetricCard label="Overdue" value="0" />
        </div>

        {/* VOPSy Briefing */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>VOPSy Daily Briefing</div>
          <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ color: C.text2, fontSize: 13 }}>
              Good morning! Your operations snapshot will appear here once you start using the platform.
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <button
              onClick={() => navigate("/tasks")}
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
              ✅ New Task
            </button>
            <button
              onClick={() => navigate("/calendar")}
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
              📅 Create Event
            </button>
            <button
              onClick={() => navigate("/vault")}
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
              📁 Upload File
            </button>
            <button
              onClick={() => navigate("/vopsy")}
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
              💬 Ask VOPSy
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
