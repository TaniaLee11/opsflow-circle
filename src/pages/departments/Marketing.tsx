import { useNavigate } from "react-router-dom";
import { C, departmentColors } from "@/components/shared/theme";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Navigation } from "@/components/layout/Navigation";

export default function Marketing() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation />
      <main style={{ marginLeft: 220, flex: 1, overflowY: "auto", padding: 32 }}>
        <PageHeader
          title="Marketing"
          desc="Attraction and outbound growth"
        />

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <MetricCard label="Total Reach" value="—" />
          <MetricCard label="Engagement Rate" value="—" />
          <MetricCard label="Active Campaigns" value="—" />
          <MetricCard label="Leads This Month" value="—" />
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: C.text1, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <button
              onClick={() => navigate("/social")}
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
              📱 Social Media
            </button>
            <button
              onClick={() => navigate("/campaigns")}
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
              🎯 Campaigns
            </button>
            <button
              onClick={() => navigate("/studio")}
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
              ✨ Studio
            </button>
            <button
              onClick={() => navigate("/funnels")}
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
              🚀 Funnels
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
