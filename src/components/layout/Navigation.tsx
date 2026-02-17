import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { C } from "@/lib/design-system";
import {
  LayoutDashboard,
  Sparkles,
  GraduationCap,
  Megaphone,
  TrendingUp,
  Heart,
  DollarSign,
  Settings,
  Users,
  Calendar,
  CheckSquare,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedDepts, setExpandedDepts] = useState<string[]>(["marketing"]);

  const toggleDept = (dept: string) => {
    if (expandedDepts.includes(dept)) {
      setExpandedDepts(expandedDepts.filter((d) => d !== dept));
    } else {
      setExpandedDepts([...expandedDepts, dept]);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItemStyle = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 16px",
    color: active ? C.accent : C.text2,
    background: active ? C.accentSoft : "transparent",
    borderRight: active ? `2px solid ${C.accent}` : "none",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    transition: "all 0.2s",
  });

  const subItemStyle = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 16px 6px 40px",
    color: active ? C.accent : C.text3,
    background: active ? C.accentSoft : "transparent",
    borderRight: active ? `2px solid ${C.accent}` : "none",
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    transition: "all 0.2s",
  });

  const deptHeaderStyle = (expanded: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 16px",
    color: C.text2,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  });

  return (
    <aside
      style={{
        width: 220,
        height: "100vh",
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ color: C.accent, fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>
          VIRTUAL OPS HUB
        </div>
        <div style={{ color: C.text3, fontSize: 9, marginTop: 2 }}>
          Human-Led AI Operating System
        </div>
      </div>

      {/* Top Nav */}
      <div style={{ padding: "10px 0" }}>
        <div style={navItemStyle(isActive("/dashboard"))} onClick={() => navigate("/dashboard")}>
          <LayoutDashboard size={16} />
          Dashboard
        </div>
        <div style={navItemStyle(isActive("/vopsy"))} onClick={() => navigate("/vopsy")}>
          <Sparkles size={16} />
          VOPSy
        </div>
        <div style={navItemStyle(isActive("/academy"))} onClick={() => navigate("/academy")}>
          <GraduationCap size={16} />
          Academy
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: C.border, margin: "10px 16px" }} />

      {/* Departments */}
      <div style={{ padding: "10px 0" }}>
        <div style={{ color: C.text3, fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "0 16px 8px", textTransform: "uppercase" }}>
          DEPARTMENTS
        </div>

        {/* Marketing */}
        <div>
          <div style={deptHeaderStyle(expandedDepts.includes("marketing"))} onClick={() => { toggleDept("marketing"); navigate("/marketing"); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Megaphone size={16} />
              Marketing
            </div>
            {expandedDepts.includes("marketing") ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expandedDepts.includes("marketing") && (
            <>
              <div style={subItemStyle(isActive("/social"))} onClick={() => navigate("/social")}>Social Media</div>
              <div style={subItemStyle(isActive("/campaigns"))} onClick={() => navigate("/campaigns")}>Campaigns</div>
              <div style={subItemStyle(isActive("/studio"))} onClick={() => navigate("/studio")}>Studio</div>
              <div style={subItemStyle(isActive("/funnels"))} onClick={() => navigate("/funnels")}>Funnels</div>
            </>
          )}
        </div>

        {/* Sales */}
        <div>
          <div style={deptHeaderStyle(expandedDepts.includes("sales"))} onClick={() => { toggleDept("sales"); navigate("/sales"); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} />
              Sales
            </div>
            {expandedDepts.includes("sales") ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expandedDepts.includes("sales") && (
            <>
              <div style={subItemStyle(isActive("/pipeline"))} onClick={() => navigate("/pipeline")}>Pipeline</div>
              <div style={subItemStyle(isActive("/crm"))} onClick={() => navigate("/crm")}>CRM</div>
              <div style={subItemStyle(isActive("/proposals"))} onClick={() => navigate("/proposals")}>Proposals</div>
              <div style={subItemStyle(isActive("/contracts"))} onClick={() => navigate("/contracts")}>Contracts</div>
            </>
          )}
        </div>

        {/* Client Care (renamed from Support) */}
        <div>
          <div style={deptHeaderStyle(expandedDepts.includes("clientcare"))} onClick={() => { toggleDept("clientcare"); navigate("/clientcare"); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Heart size={16} />
              Client Care
            </div>
            {expandedDepts.includes("clientcare") ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expandedDepts.includes("clientcare") && (
            <>
              <div style={subItemStyle(isActive("/inbox"))} onClick={() => navigate("/inbox")}>Inbox</div>
              <div style={subItemStyle(isActive("/followups"))} onClick={() => navigate("/followups")}>Follow-ups</div>
              <div style={subItemStyle(isActive("/surveys"))} onClick={() => navigate("/surveys")}>Surveys</div>
            </>
          )}
        </div>

        {/* Finance */}
        <div>
          <div style={deptHeaderStyle(expandedDepts.includes("finance"))} onClick={() => { toggleDept("finance"); navigate("/finance"); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DollarSign size={16} />
              Finance
            </div>
            {expandedDepts.includes("finance") ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expandedDepts.includes("finance") && (
            <>
              <div style={subItemStyle(isActive("/reconciliation"))} onClick={() => navigate("/reconciliation")}>Reconciliation</div>
              <div style={subItemStyle(isActive("/tax"))} onClick={() => navigate("/tax")}>Tax Organizer</div>
              <div style={subItemStyle(isActive("/reports"))} onClick={() => navigate("/reports")}>Reports & Analytics</div>
              <div style={subItemStyle(isActive("/cashflow"))} onClick={() => navigate("/cashflow")}>Cash Flow</div>
              <div style={subItemStyle(isActive("/banking"))} onClick={() => navigate("/banking")}>Banking</div>
              <div style={subItemStyle(isActive("/funding"))} onClick={() => navigate("/funding")}>Funding Readiness</div>
              <div style={subItemStyle(isActive("/grants"))} onClick={() => navigate("/grants")}>Donation/Grant Tracking</div>
            </>
          )}
        </div>

        {/* Systems */}
        <div>
          <div style={deptHeaderStyle(expandedDepts.includes("systems"))} onClick={() => { toggleDept("systems"); navigate("/systems"); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Settings size={16} />
              Systems
            </div>
            {expandedDepts.includes("systems") ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expandedDepts.includes("systems") && (
            <>
              <div style={subItemStyle(isActive("/integrations"))} onClick={() => navigate("/integrations")}>Integrations</div>
              <div style={subItemStyle(isActive("/workflows"))} onClick={() => navigate("/workflows")}>Workflows</div>
            </>
          )}
        </div>

        {/* People */}
        <div>
          <div style={deptHeaderStyle(expandedDepts.includes("people"))} onClick={() => { toggleDept("people"); navigate("/people"); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={16} />
              People
            </div>
            {expandedDepts.includes("people") ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {expandedDepts.includes("people") && (
            <>
              <div style={subItemStyle(isActive("/contractors"))} onClick={() => navigate("/contractors")}>Contractors</div>
              <div style={subItemStyle(isActive("/roles"))} onClick={() => navigate("/roles")}>Roles & Permissions</div>
              <div style={subItemStyle(isActive("/payroll"))} onClick={() => navigate("/payroll")}>Payroll</div>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: C.border, margin: "10px 16px" }} />

      {/* Tools */}
      <div style={{ padding: "10px 0" }}>
        <div style={{ color: C.text3, fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "0 16px 8px", textTransform: "uppercase" }}>
          TOOLS
        </div>
        <div style={navItemStyle(isActive("/calendar"))} onClick={() => navigate("/calendar")}>
          <Calendar size={16} />
          Calendar
        </div>
        <div style={navItemStyle(isActive("/tasks"))} onClick={() => navigate("/tasks")}>
          <CheckSquare size={16} />
          Tasks
        </div>
        <div style={navItemStyle(isActive("/vault"))} onClick={() => navigate("/vault")}>
          <FolderOpen size={16} />
          Vault
        </div>
      </div>
    </aside>
  );
}
