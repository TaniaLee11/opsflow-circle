import { useState } from 'react';
import { C, getCardGradient, getCardBorder, cardBaseStyles } from "@/components/shared/theme";
import { Navigation } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { VOPSyInsight } from '@/components/shared/VOPSyInsight';
import { CreateModal } from '@/components/shared/CreateModal';
import { DeleteConfirm } from '@/components/shared/DeleteConfirm';
import { useToast } from '@/components/shared/Toast';
import { FileText } from 'lucide-react';


export default function Documents() {
  const [items, setItems] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Proposals');
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
  const isConnected = userContext.integrations.includes('dotloop');

  const handleCreate = (data: any) => {
    const newItem = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
    setItems([...items, newItem]);
    setShowCreateModal(false);
    showToast('success', 'Document created successfully');
  };
  
  const handleDelete = () => {
    setItems(items.filter(item => item.id !== selectedItem?.id));
    setShowDeleteConfirm(false);
    setSelectedItem(null);
    showToast('success', 'Document deleted');
  };
  
  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main className="p-6 lg:p-8">
        <PageHeader 
          title="Proposals & Contracts"
          subtitle="{isConnected ? 'Connected to Dotloop' : 'Track manually or connect Dotloop'}"
          icon={FileText}
          action={{
            label: "Add Document",
            onClick: () => setShowCreateModal(true),
            color: "#9333EA"
          }}
        />
        
        <VOPSyInsight page="documents" userContext={userContext} />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, borderBottom: '1px solid #1E293B' }}>
        {<button onClick={() => setActiveTab('Proposals')} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'Proposals' ? '2px solid #9333EA' : 'none', color: activeTab === 'Proposals' ? '#9333EA' : C.text2, fontWeight: activeTab === 'Proposals' ? 600 : 400, cursor: 'pointer' }}>Proposals</button>, <button onClick={() => setActiveTab('Contracts')} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'Contracts' ? '2px solid #9333EA' : 'none', color: activeTab === 'Contracts' ? '#9333EA' : C.text2, fontWeight: activeTab === 'Contracts' ? 600 : 400, cursor: 'pointer' }}>Contracts</button>}
      </div>
        {items.length === 0 ? (
          <div style={{
            background: getCardGradient("#9333EA"), borderRadius: 12,
            border: getCardBorder("#9333EA"),
            padding: 48, textAlign: "center"
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ color: C.text1, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              No documents yet
            </div>
            <div style={{ color: C.text2, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              {isConnected 
                ? 'Data will appear after your first sync with Dotloop.'
                : 'Add documents manually or connect Dotloop to sync automatically.'
              }
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button 
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: getCardGradient("#9333EA"), color: "#fff", border: "none",
                  padding: "8px 18px", borderRadius: 8, fontWeight: 600,
                  fontSize: 13, cursor: "pointer"
                }}
              >
                Add Document
              </button>
              {!isConnected && (
                <button style={{
                  background: "transparent", color: C.accent,
                  border: `1px solid ${C.accent}`, padding: "8px 18px",
                  borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer"
                }}
                  onClick={() => window.location.href = '/integrations'}
                >
                  Connect Dotloop →
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
                    background: 'transparent', border: getCardBorder("#9333EA"),
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
          title="Add Document"
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
