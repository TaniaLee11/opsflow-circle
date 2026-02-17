import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { VOPSyInsight } from '@/components/shared/VOPSyInsight';
import { CreateModal } from '@/components/shared/CreateModal';
import { DeleteConfirm } from '@/components/shared/DeleteConfirm';
import { useToast } from '@/components/shared/Toast';
import { TrendingUp } from 'lucide-react';

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

export default function FundingReadiness() {
  const [items, setItems] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const { showToast } = useToast();
  
  // Mock user context - in production, get from auth
  const userContext = {
    name: 'Tanya',
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
        <main style={{ padding: 32 }}>
          <PageHeader 
            title="Funding Readiness"
            subtitle="Available in Operating and Growing stages"
            icon={TrendingUp}
          />
          <VOPSyInsight page="funding" userContext={userContext} />
          <div style={{
            background: C.card, borderRadius: 12,
            border: `1px solid ${C.border}`,
            padding: 48, textAlign: "center"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ color: C.text1, fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              This page is locked
            </div>
            <div style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
              Funding Readiness becomes available when you move to the Operating stage. 
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
    showToast('success', 'Funding Milestone created successfully');
  };
  
  const handleDelete = () => {
    setItems(items.filter(item => item.id !== selectedItem?.id));
    setShowDeleteConfirm(false);
    setSelectedItem(null);
    showToast('success', 'Funding Milestone deleted');
  };
  
  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main style={{ padding: 32 }}>
        <PageHeader 
          title="Funding Readiness"
          subtitle="{isConnected ? 'Connected to QuickBooks' : 'Track manually or connect QuickBooks'}"
          icon={TrendingUp}
          action={{
            label: "Add Funding Milestone",
            onClick: () => setShowCreateModal(true),
            color: "#059669"
          }}
        />
        
        <VOPSyInsight page="funding" userContext={userContext} />

        {items.length === 0 ? (
          <div style={{
            background: C.card, borderRadius: 12,
            border: `1px solid ${C.border}`,
            padding: 48, textAlign: "center"
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ color: C.text1, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              No funding milestones yet
            </div>
            <div style={{ color: C.text2, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              {isConnected 
                ? 'Data will appear after your first sync with QuickBooks.'
                : 'Add funding milestones manually or connect QuickBooks to sync automatically.'
              }
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button 
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: "#059669", color: "#fff", border: "none",
                  padding: "8px 18px", borderRadius: 8, fontWeight: 600,
                  fontSize: 13, cursor: "pointer"
                }}
              >
                Add Funding Milestone
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
          <div style={{ display: 'grid', gap: 16 }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: 16, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center'
              }}>
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
                    background: 'transparent', border: `1px solid ${C.border}`,
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
          title="Add Funding Milestone"
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
