import { Navigation } from "@/components/layout/Navigation";
import { DollarSign, TrendingUp, Users, CheckSquare, Plus, Calendar, Upload, MessageSquare, AlertCircle, CheckCircle2, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const C = {
  bg: "#0B1120",
  card: "linear-gradient(135deg, #1A2332 0%, #1E2A3C 100%)",
  border: "rgba(255,255,255,0.06)",
  text1: "#F1F5F9",
  text2: "#94A3B8",
  text3: "#64748B",
  accent: "#0891B2",
  accentSoft: "rgba(8,145,178,0.12)",
  success: "#10B981",
  warning: "#F59E0B",
};

export default function Dashboard() {
  const navigate = useNavigate();
  
  const userContext = {
    name: 'Tania',
    plan: 'owner' as const,
    stage: 'foundations' as const,
  };

  // Mock data - in production, this comes from integrations or manual entry
  const needsAttention = [
    // { text: "4 transactions need categorization", action: "Review →", path: "/reconciliation" },
    // { text: "2 follow-ups overdue", action: "Open →", path: "/followups" },
    // { text: "Tax deadline in 12 days", action: "Details →", path: "/tax" },
  ];

  const connectedTools = [
    // { name: "QuickBooks", connected: true },
    // { name: "Gmail", connected: true },
    // { name: "GoHighLevel", connected: true },
    // { name: "Stripe", connected: false },
  ];

  const recommendedCourse = {
    title: "What It Means to Be In Business",
    duration: "15 min",
    description: "Great starting point for new business owners.",
    path: "/academy",
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg }}>
      <Navigation />
      
      <main className="flex-1 p-6 lg:p-8">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
          
          {/* Header */}
          <h1 style={{ color: C.text1, fontSize: 28, fontWeight: 700, marginBottom: 32 }}>
            Welcome back, {userContext.name}
          </h1>

          {/* VOPSy Insight Panel */}
          <div className="glass gradient-border" style={{
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.accentSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.accent,
              }}>
                🤖
              </div>
              <span style={{ color: C.accent, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                VOPSy
              </span>
            </div>
            <p style={{ color: C.text2, fontSize: 14, lineHeight: 1.6 }}>
              All systems operational. Your platform is live with 30 pages. Connect your business tools to activate VOPSy's full intelligence.
            </p>
          </div>

          {/* Needs Your Attention */}
          <div className="glass gradient-border" style={{
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 24,
          }}>
            <h2 style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              Needs Your Attention
            </h2>
            {needsAttention.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                <CheckCircle2 size={20} style={{ color: C.success }} />
                <span style={{ color: C.text2, fontSize: 14 }}>
                  ✅ Nothing urgent right now. You're in good shape.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {needsAttention.map((item, i) => (
                  <div key={i} className="glass" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <AlertCircle size={16} style={{ color: C.warning }} />
                      <span style={{ color: C.text2, fontSize: 14 }}>{item.text}</span>
                    </div>
                    <button
                      onClick={() => navigate(item.path)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: C.accent,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Your Numbers */}
          <div className="glass gradient-border" style={{
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 24,
          }}>
            <h2 style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              Your Numbers
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { label: 'Revenue MTD', value: '$0', icon: DollarSign, color: C.success },
                { label: 'Expenses MTD', value: '$0', icon: TrendingUp, color: C.warning },
                { label: 'Cash Position', value: '$0', icon: DollarSign, color: C.accent },
                { label: 'Clients', value: '0', icon: Users, color: C.text2 },
              ].map((metric, i) => (
                <div key={i} className="glass" style={{
                  borderRadius: 12,
                  padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: C.text3, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {metric.label}
                    </span>
                    <metric.icon size={16} style={{ color: metric.color, opacity: 0.6 }} />
                  </div>
                  <div style={{ color: C.text1, fontSize: 24, fontWeight: 700 }}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ color: C.text3, fontSize: 12, marginTop: 12, textAlign: 'center' }}>
              Connect accounting software to track automatically
            </p>
          </div>

          {/* Quick Actions */}
          <div className="glass gradient-border" style={{
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 24,
          }}>
            <h2 style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {[
                { label: 'Add Task', icon: Plus, path: '/tasks' },
                { label: 'Create Event', icon: Calendar, path: '/calendar' },
                { label: 'Upload File', icon: Upload, path: '/vault' },
                { label: 'Ask VOPSy', icon: MessageSquare, path: '/vopsy' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="glass"
                  style={{
                    borderRadius: 12,
                    padding: '16px',
                    color: C.text2,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    border: 'none',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = C.accentSoft;
                    e.currentTarget.style.color = C.accent;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = C.text2;
                  }}
                >
                  <action.icon size={16} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connected Tools */}
          <div className="glass gradient-border" style={{
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 24,
          }}>
            <h2 style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              Connected Tools
            </h2>
            {connectedTools.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔌</div>
                <p style={{ color: C.text2, fontSize: 14, marginBottom: 8 }}>
                  Nothing connected yet.
                </p>
                <p style={{ color: C.text3, fontSize: 13, marginBottom: 16 }}>
                  Connect your tools to unlock VOPSy's full power.
                </p>
                <button
                  onClick={() => navigate('/integrations')}
                  style={{
                    background: C.accent,
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View Integrations →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {connectedTools.map((tool, i) => (
                  <div key={i} className="glass" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 8,
                  }}>
                    <span style={{ color: C.text2, fontSize: 14 }}>{tool.name}</span>
                    {tool.connected ? (
                      <CheckCircle2 size={16} style={{ color: C.success }} />
                    ) : (
                      <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: C.accent,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}>
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learn This Week */}
          <div className="glass gradient-border" style={{
            borderRadius: 16,
            padding: '20px 24px',
          }}>
            <h2 style={{ color: C.text1, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              Learn This Week
            </h2>
            <div className="glass" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(249,115,22,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <BookOpen size={24} style={{ color: '#F97316' }} />
                </div>
                <div>
                  <div style={{ color: C.text1, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                    📚 "{recommendedCourse.title}" — {recommendedCourse.duration}
                  </div>
                  <div style={{ color: C.text3, fontSize: 13 }}>
                    {recommendedCourse.description}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(recommendedCourse.path)}
                style={{
                  background: C.accentSoft,
                  border: `1px solid ${C.accent}`,
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: C.accent,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Start Course →
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
