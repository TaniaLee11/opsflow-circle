import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, departmentColors } from "@/components/shared/theme";
import { PageHeader } from "@/components/shared/PageHeader";
import { AlertBox } from "@/components/shared/AlertBox";
import { EmptyState } from "@/components/shared/EmptyState";
import { Navigation } from "@/components/layout/Navigation";

export default function Reconciliation() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation />
      <main style={{ marginLeft: 220, flex: 1, overflowY: "auto", padding: 32 }}>
        <PageHeader
          breadcrumb="Finance → Reconciliation"
          title="Reconciliation"
          desc="Categorize and reconcile transactions from your accounting software"
        />

        <AlertBox
          icon="🔌"
          color={C.blue}
          bgColor={C.blueSoft}
          title="Integration: QuickBooks / Wave / Xero / Stripe"
        >
          <div style={{ color: C.text2, fontSize: 13 }}>
            Transactions will appear here automatically once you connect your accounting software.{" "}
            <span
              onClick={() => navigate("/integrations")}
              style={{ color: C.blue, cursor: "pointer", textDecoration: "underline" }}
            >
              Connect now
            </span>
          </div>
        </AlertBox>

        {transactions.length === 0 && (
          <EmptyState
            icon="💰"
            title="No transactions to reconcile"
            description="Connect your accounting software to start reconciling transactions."
            actionLabel="Connect Accounting Software"
            onAction={() => navigate("/integrations")}
          />
        )}
      </main>
    </div>
  );
}
