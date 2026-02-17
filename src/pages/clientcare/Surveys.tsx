import { useState } from "react";
import { C, departmentColors } from "@/components/shared/theme";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/shared/Badge";
import { CreateModal } from "@/components/shared/CreateModal";
import { FormField } from "@/components/shared/FormField";
import { Toast, useToast } from "@/components/shared/Toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { Navigation } from "@/components/layout/Navigation";

export default function Surveys() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", type: "", audience: "" });
  const { toast, showToast } = useToast();

  const handleCreate = () => {
    const newSurvey = { ...formData, id: Date.now(), status: "draft", responses: 0 };
    setSurveys([...surveys, newSurvey]);
    showToast("Survey created");
    setIsModalOpen(false);
    setFormData({ title: "", type: "", audience: "" });
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <Navigation />
      <main style={{ marginLeft: 220, flex: 1, overflowY: "auto", padding: 32 }}>
        <PageHeader
          breadcrumb="Client Care → Surveys"
          title="Surveys"
          desc="Create and manage client feedback surveys"
          actionLabel="Create Survey"
          actionColor={departmentColors.clientcare}
          onAction={() => setIsModalOpen(true)}
        />

        {/* Empty state */}
        {surveys.length === 0 && (
          <EmptyState
            icon="📊"
            title="No surveys yet"
            description="Create your first survey to gather client feedback."
            actionLabel="Create Survey"
            onAction={() => setIsModalOpen(true)}
          />
        )}

        {/* Surveys list */}
        {surveys.length > 0 && (
          <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {surveys.map((survey, i) => (
              <div
                key={survey.id}
                style={{
                  padding: "14px 16px",
                  borderBottom: i < surveys.length - 1 ? `1px solid ${C.border}` : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: C.text1, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{survey.title}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge type="info" label={survey.type} />
                    <Badge type={survey.status === "active" ? "ok" : "muted"} label={survey.status} />
                    <span style={{ color: C.text3, fontSize: 12 }}>{survey.responses} responses</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <CreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Survey"
          onSave={handleCreate}
          saveColor={departmentColors.clientcare}
        >
          <FormField label="Survey Title" type="text" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} />
          <FormField
            label="Type"
            type="select"
            value={formData.type}
            onChange={(v) => setFormData({ ...formData, type: v })}
            options={[
              { value: "nps", label: "NPS (Net Promoter Score)" },
              { value: "csat", label: "CSAT (Customer Satisfaction)" },
              { value: "feedback", label: "General Feedback" },
              { value: "exit", label: "Exit Survey" },
            ]}
          />
          <FormField
            label="Audience"
            type="select"
            value={formData.audience}
            onChange={(v) => setFormData({ ...formData, audience: v })}
            options={[
              { value: "all", label: "All Clients" },
              { value: "active", label: "Active Clients" },
              { value: "recent", label: "Recent Purchasers" },
              { value: "churned", label: "Churned Clients" },
            ]}
          />
        </CreateModal>

        <Toast message={toast.message} isVisible={toast.isVisible} />
      </main>
    </div>
  );
}
