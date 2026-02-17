import { useState } from 'react';
import { C, getCardGradient, getCardBorder, cardBaseStyles } from "@/components/shared/theme";
import { Navigation } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { VOPSyInsight } from '@/components/shared/VOPSyInsight';
import { CreateModal } from '@/components/shared/CreateModal';
import { DeleteConfirm } from '@/components/shared/DeleteConfirm';
import { useToast } from '@/components/shared/Toast';
import { Gift } from 'lucide-react';

const C = {
  bg: "#0B1120",
  surface: "#111827",
  card: "#1A2332",
  border: "#1E293B",
  accent: "#0891B2",
  text1: "#F1F5F9",
  text2: "#94A3B8",
  text3: "#64748B",
};

export default function Grants() {
  const [items, setItems] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const { showToast } = useToast();
  
  // Mock user context - in production, get from auth
  const userContext = {
    name: 'Tania',
    stage: 'foundations' as const,
    tier: 'free' as const,
    industry: 'owner' as const,
    integrations: [],
  };
  
  // Check if tool is connected
  const isConnected = userContext.integrations.includes('quickbooks');

  if (userContext.stage === 'foundations') {
    return (
      <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
        <Navigation />
        <main className="p-6 lg:p-8">
          <PageHeader 
            title="Grants"
            subtitle="Available in Operating and Growing stages"
            icon={Gift}
          />
          <VOPSyInsight page="grants" userContext={userContext} />
          <div style={{
            background: getCardGradient("#059669"), borderRadius: 12,
            border: getCardBorder("#059669"),
            padding: 48, textAlign: "center"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ color: C.text1, fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              This page is locked
            </div>
            <div style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
              Grants becomes available when you move to the Operating stage. 
              Focus on building your foundation first, then we'll help you scale your team.
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleCreate = (data: any) => {
    const newItem = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
    setItems([...items, newItem]);
    setShowCreateModal(false);
    showToast('success', 'Grant created successfully');
  };
  
  const handleDelete = () => {
    setItems(items.filter(item => item.id !== selectedItem?.id));
    setShowDeleteConfirm(false);
    setSelectedItem(null);
    showToast('success', 'Grant deleted');
  };
  
  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main className="p-6 lg:p-8">
        <PageHeader 
          title="Grants"
          subtitle="{isConnected ? 'Connected to QuickBooks' : 'Track manually or connect QuickBooks'}"
          icon={Gift}
          action={{
            label: "Add Grant",
            onClick: () => setShowCreateModal(true),
            color: "#059669"
          }}
        />
        
        <VOPSyInsight page="grants" userContext={userContext} />

        {items.length === 0 ? (
          <div style={{
            background: getCardGradient("#059669"), borderRadius: 12,
            border: getCardBorder("#059669"),
            padding: 48, textAlign: "center"
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ color: C.text1, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              No grants yet
            </div>
            <div style={{ color: C.text2, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              {isConnected 
                ? 'Data will appear after your first sync with QuickBooks.'
                : 'Add grants manually or connect QuickBooks to sync automatically.'
              }
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button 
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: getCardGradient("#059669"), color: "#fff", border: "none",
                  padding: "8px 18px", borderRadius: 8, fontWeight: 600,
                  fontSize: 13, cursor: "pointer"
                }}
              >
                Add Grant
              </button>
              {!isConnected && (
                <button style={{
                  background: "transparent", color: C.accent,
                  border: `1px solid ${C.accent}`, padding: "8px 18px",
                  borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer"
                }}
                  onClick={() => window.location.href = '/integrations'}
                >
                  Connect QuickBooks →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item.id} className="glass gradient-border rounded-xl p-6">
                <div>
                  <div style={{ color: C.text1, fontWeight: 600, marginBottom: 4 }}>
                    {item.name || item.title}
                  </div>
                  <div style={{ color: C.text3, fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedItem(item); setShowDeleteConfirm(true); }}
                  style={{
                    background: 'transparent', border: getCardBorder("#059669"),
                    color: C.text2, padding: '6px 12px', borderRadius: 6,
                    fontSize: 12, cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {showCreateModal && (
        <CreateModal
          title="Add Grant"
          fields={[
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      
      {showDeleteConfirm && (
        <DeleteConfirm
          itemName={selectedItem?.name || selectedItem?.title}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteConfirm(false); setSelectedItem(null); }}
        />
      )}
    </div>
  );
}
