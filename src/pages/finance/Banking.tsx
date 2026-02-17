import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, departmentColors } from "@/components/shared/theme";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateModal } from "@/components/shared/CreateModal";
import { FormField } from "@/components/shared/FormField";
import { Toast, useToast } from "@/components/shared/Toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { Navigation } from "@/components/layout/Navigation";

export default function Banking() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { toast, showToast } = useToast();

  const handleCreate = () => {
    setItems([...items, { ...formData, id: Date.now() }]);
    showToast("Banking created");
    setIsModalOpen(false);
    setFormData({ name: "", description: "" });
  };

  return (
    <div style={ { display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" } }>
      <Navigation />
      <main style={ { marginLeft: 220, flex: 1, overflowY: "auto", padding: 32 } }>
        <PageHeader
          breadcrumb="Finance → Banking"
          title="Banking"
          desc="Manage banking connections and accounts"
          actionLabel="Create"
          actionColor={departmentColors.finance}
          onAction={() => setIsModalOpen(true)}
        />

        {items.length === 0 && (
          <EmptyState
            icon="🏦"
            title="No bank accounts connected"
            description="Get started by creating your first item."
            actionLabel="Create"
            onAction={() => setIsModalOpen(true)}
          />
        )}

        {items.length > 0 && (
          <div style={ { background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" } }>
            {items.map((item, i) => (
              <div key={item.id} style={ { padding: "14px 16px", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" } }>
                <div style={ { color: C.text1, fontSize: 14, fontWeight: 600 } }>{item.name}</div>
              </div>
            ))}
          </div>
        )}

        <CreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Banking" onSave={handleCreate} saveColor={departmentColors.finance}>
          <FormField label="Name" type="text" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
          <FormField label="Description" type="textarea" value={formData.description} onChange={(v) => setFormData({...formData, description: v})} />
        </CreateModal>

        <Toast message={toast.message} isVisible={toast.isVisible} />
      </main>
    </div>
  );
}
