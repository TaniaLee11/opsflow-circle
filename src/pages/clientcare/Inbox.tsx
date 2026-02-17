import { useState } from "react";
import { C, departmentColors } from "@/components/shared/theme";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/shared/Badge";
import { CreateModal } from "@/components/shared/CreateModal";
import { FormField } from "@/components/shared/FormField";
import { Toast, useToast } from "@/components/shared/Toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { Navigation } from "@/components/layout/Navigation";

export default function Inbox() {
  const [activeTab, setActiveTab] = useState<"messages" | "tickets">("messages");
  const [messages, setMessages] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ to: "", subject: "", body: "", priority: "normal" });
  const { toast, showToast } = useToast();

  const handleCreate = () => {
    if (activeTab === "messages") {
      const newMessage = { ...formData, id: Date.now(), status: "sent", date: new Date().toISOString() };
      setMessages([...messages, newMessage]);
      showToast("Message sent");
    } else {
      const newTicket = { ...formData, id: Date.now(), status: "open", date: new Date().toISOString() };
      setTickets([...tickets, newTicket]);
      showToast("Ticket created");
    }
    setIsModalOpen(false);
    setFormData({ to: "", subject: "", body: "", priority: "normal" });
  };

  const currentItems = activeTab === "messages" ? messages : tickets;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation />
      <main style={{ marginLeft: 220, flex: 1, overflowY: "auto", padding: 32 }}>
        <PageHeader
          breadcrumb="Client Care → Inbox"
          title="Inbox"
          desc="Manage client communications and support tickets"
          actionLabel={activeTab === "messages" ? "Compose Message" : "New Ticket"}
          actionColor={departmentColors.clientcare}
          onAction={() => setIsModalOpen(true)}
        />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, borderBottom: `1px solid ${C.border}` }}>
          <button
            onClick={() => setActiveTab("messages")}
            style={{
              background: "transparent",
              border: "none",
              color: activeTab === "messages" ? C.purple : C.text3,
              borderBottom: activeTab === "messages" ? `2px solid ${C.purple}` : "none",
              padding: "10px 0",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            style={{
              background: "transparent",
              border: "none",
              color: activeTab === "tickets" ? C.purple : C.text3,
              borderBottom: activeTab === "tickets" ? `2px solid ${C.purple}` : "none",
              padding: "10px 0",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tickets
          </button>
        </div>

        {/* Empty state */}
        {currentItems.length === 0 && (
          <EmptyState
            icon={activeTab === "messages" ? "💬" : "🎫"}
            title={activeTab === "messages" ? "No messages" : "No tickets"}
            description={activeTab === "messages" ? "Send your first message to a client." : "Create your first support ticket."}
            actionLabel={activeTab === "messages" ? "Compose Message" : "New Ticket"}
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
                  <div style={{ color: C.text1, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.subject}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: C.text3, fontSize: 12 }}>{item.to}</span>
                    <Badge type={item.priority === "high" ? "error" : item.priority === "normal" ? "info" : "muted"} label={item.priority} />
                    {activeTab === "tickets" && (
                      <Badge type={item.status === "open" ? "warn" : "ok"} label={item.status} />
                    )}
                  </div>
                </div>
                <div style={{ color: C.text3, fontSize: 12 }}>{new Date(item.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}

        <CreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={activeTab === "messages" ? "Compose Message" : "New Ticket"}
          onSave={handleCreate}
          saveColor={departmentColors.clientcare}
        >
          <FormField label="To" type="text" value={formData.to} onChange={(v) => setFormData({ ...formData, to: v })} placeholder="Client name or email" />
          <FormField label="Subject" type="text" value={formData.subject} onChange={(v) => setFormData({ ...formData, subject: v })} />
          <FormField label="Message" type="textarea" value={formData.body} onChange={(v) => setFormData({ ...formData, body: v })} rows={6} />
          <FormField
            label="Priority"
            type="select"
            value={formData.priority}
            onChange={(v) => setFormData({ ...formData, priority: v })}
            options={[
              { value: "low", label: "Low" },
              { value: "normal", label: "Normal" },
              { value: "high", label: "High" },
            ]}
          />
        </CreateModal>

        <Toast message={toast.message} isVisible={toast.isVisible} />
      </main>
    </div>
  );
}
