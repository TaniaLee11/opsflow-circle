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

export default function Pipeline() {
  const [items, setItems] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Active');
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
  const isConnected = userContext.integrations.includes('gohighlevel');

  const handleCreate = (data: any) => {
    const newItem = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
    setItems([...items, newItem]);
    setShowCreateModal(false);
    showToast('success', 'Deal created successfully');
  };
  
  const handleDelete = () => {
    setItems(items.filter(item => item.id !== selectedItem?.id));
    setShowDeleteConfirm(false);
    setSelectedItem(null);
    showToast('success', 'Deal deleted');
  };
  
  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main style={{ padding: 32 }}>
        <PageHeader 
          title="Pipeline"
          subtitle="{isConnected ? 'Connected to GoHighLevel' : 'Track manually or connect GoHighLevel'}"
          icon={TrendingUp}
          action={{
            label: "Add Deal",
            onClick: () => setShowCreateModal(true),
            color: "#9333EA"
          }}
        />
        
        <VOPSyInsight page="pipeline" userContext={userContext} />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, borderBottom: '1px solid #1E293B' }}>
        {<button onClick={() => setActiveTab('Active')} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'Active' ? '2px solid #9333EA' : 'none', color: activeTab === 'Active' ? '#9333EA' : C.text2, fontWeight: activeTab === 'Active' ? 600 : 400, cursor: 'pointer' }}>Active</button>, <button onClick={() => setActiveTab('Won')} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'Won' ? '2px solid #9333EA' : 'none', color: activeTab === 'Won' ? '#9333EA' : C.text2, fontWeight: activeTab === 'Won' ? 600 : 400, cursor: 'pointer' }}>Won</button>, <button onClick={() => setActiveTab('Lost')} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'Lost' ? '2px solid #9333EA' : 'none', color: activeTab === 'Lost' ? '#9333EA' : C.text2, fontWeight: activeTab === 'Lost' ? 600 : 400, cursor: 'pointer' }}>Lost</button>}
      </div>
        {items.length === 0 ? (
          <div style={{
            background: C.card, borderRadius: 12,
            border: `1px solid ${C.border}`,
            padding: 48, textAlign: "center"
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ color: C.text1, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              No deals yet
            </div>
            <div style={{ color: C.text2, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              {isConnected 
                ? 'Data will appear after your first sync with GoHighLevel.'
                : 'Add deals manually or connect GoHighLevel to sync automatically.'
              }
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button 
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: "#9333EA", color: "#fff", border: "none",
                  padding: "8px 18px", borderRadius: 8, fontWeight: 600,
                  fontSize: 13, cursor: "pointer"
                }}
              >
                Add Deal
              </button>
              {!isConnected && (
                <button style={{
                  background: "transparent", color: C.accent,
                  border: `1px solid ${C.accent}`, padding: "8px 18px",
                  borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer"
                }}
                  onClick={() => window.location.href = '/integrations'}
                >
                  Connect GoHighLevel →
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
          title="Add Deal"
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
