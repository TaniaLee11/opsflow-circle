import { useState } from "react";
import { C, departmentColors } from "@/components/shared/theme";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/shared/Badge";
import { CreateModal } from "@/components/shared/CreateModal";
import { FormField } from "@/components/shared/FormField";
import { Toast, useToast } from "@/components/shared/Toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { Navigation } from "@/components/layout/Navigation";

export default function Followups() {
  const [activeTab, setActiveTab] = useState<"queue" | "rules">("queue");
  const [followups, setFollowups] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ client: "", type: "", dueDate: "", trigger: "", action: "" });
  const { toast, showToast } = useToast();

  const handleCreate = () => {
    if (activeTab === "queue") {
      const newFollowup = { ...formData, id: Date.now(), status: "pending" };
      setFollowups([...followups, newFollowup]);
      showToast("Follow-up created");
    } else {
      const newRule = { ...formData, id: Date.now(), active: true };
      setRules([...rules, newRule]);
      showToast("Rule created");
    }
    setIsModalOpen(false);
    setFormData({ client: "", type: "", dueDate: "", trigger: "", action: "" });
  };

  const currentItems = activeTab === "queue" ? followups : rules;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation />
      <main style={{ marginLeft: 220, flex: 1, overflowY: "auto", padding: 32 }}>
        <PageHeader
          breadcrumb="Client Care → Follow-ups"
          title="Follow-ups"
          desc="Manage client follow-up queue and automation rules"
          actionLabel={activeTab === "queue" ? "New Follow-up" : "Create Rule"}
          actionColor={departmentColors.clientcare}
          onAction={() => setIsModalOpen(true)}
        />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, borderBottom: `1px solid ${C.border}` }}>
          <button
            onClick={() => setActiveTab("queue")}
            style={{
              background: "transparent",
              border: "none",
              color: activeTab === "queue" ? C.purple : C.text3,
              borderBottom: activeTab === "queue" ? `2px solid ${C.purple}` : "none",
              padding: "10px 0",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Queue
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            style={{
              background: "transparent",
              border: "none",
              color: activeTab === "rules" ? C.purple : C.text3,
              borderBottom: activeTab === "rules" ? `2px solid ${C.purple}` : "none",
              padding: "10px 0",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Rules
          </button>
        </div>

        {/* Empty state */}
        {currentItems.length === 0 && (
          <EmptyState
            icon={activeTab === "queue" ? "📋" : "⚡"}
            title={activeTab === "queue" ? "No follow-ups scheduled" : "No automation rules"}
            description={activeTab === "queue" ? "Create your first follow-up task." : "Set up your first automation rule."}
            actionLabel={activeTab === "queue" ? "New Follow-up" : "Create Rule"}
            onAction={() => setIsModalOpen(true)}
          />
        )}

        {/* Items list */}
        {currentItems.length > 0 && (
          <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {currentItems.map((item, i) => (
              <div
                key={item.id}
                style={{
                  padding: "14px 16px",
                  borderBottom: i < currentItems.length - 1 ? `1px solid ${C.border}` : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: C.text1, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {activeTab === "queue" ? item.client : item.trigger}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge type="info" label={activeTab === "queue" ? item.type : item.action} />
                    {activeTab === "rules" && <Badge type={item.active ? "ok" : "muted"} label={item.active ? "active" : "inactive"} />}
                  </div>
                </div>
                {activeTab === "queue" && <div style={{ color: C.text3, fontSize: 12 }}>{item.dueDate}</div>}
              </div>
            ))}
          </div>
        )}

        <CreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={activeTab === "queue" ? "New Follow-up" : "Create Rule"}
          onSave={handleCreate}
          saveColor={departmentColors.clientcare}
        >
          {activeTab === "queue" ? (
            <>
              <FormField label="Client" type="text" value={formData.client} onChange={(v) => setFormData({ ...formData, client: v })} />
              <FormField
                label="Type"
                type="select"
                value={formData.type}
                onChange={(v) => setFormData({ ...formData, type: v })}
                options={[
                  { value: "check-in", label: "Check-in" },
                  { value: "renewal", label: "Renewal" },
                  { value: "feedback", label: "Feedback Request" },
                  { value: "upsell", label: "Upsell Opportunity" },
                ]}
              />
              <FormField label="Due Date" type="date" value={formData.dueDate} onChange={(v) => setFormData({ ...formData, dueDate: v })} />
            </>
          ) : (
            <>
              <FormField
                label="Trigger"
                type="select"
                value={formData.trigger}
                onChange={(v) => setFormData({ ...formData, trigger: v })}
                options={[
                  { value: "30-days-no-contact", label: "30 days no contact" },
                  { value: "contract-expiring", label: "Contract expiring" },
                  { value: "ticket-resolved", label: "Ticket resolved" },
                  { value: "payment-received", label: "Payment received" },
                ]}
              />
              <FormField
                label="Action"
                type="select"
                value={formData.action}
                onChange={(v) => setFormData({ ...formData, action: v })}
                options={[
                  { value: "send-email", label: "Send email" },
                  { value: "create-task", label: "Create task" },
                  { value: "send-survey", label: "Send survey" },
                  { value: "notify-team", label: "Notify team" },
                ]}
              />
            </>
          )}
        </CreateModal>

        <Toast message={toast.message} isVisible={toast.isVisible} />
      </main>
    </div>
  );
}
