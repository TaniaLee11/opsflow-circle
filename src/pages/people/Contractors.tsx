import { useState } from 'react';
import { C, getCardGradient, getCardBorder, cardBaseStyles } from "@/components/shared/theme";
import { Navigation } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { VOPSyInsight } from '@/components/shared/VOPSyInsight';
import { CreateModal } from '@/components/shared/CreateModal';
import { DeleteConfirm } from '@/components/shared/DeleteConfirm';
import { useToast } from '@/components/shared/Toast';
import { Users } from 'lucide-react';


export default function Team() {
  const [items, setItems] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Active');
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
  const isConnected = userContext.integrations.includes('gusto');

  if (userContext.stage === 'foundations') {
    return (
      <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
        <Navigation />
        <main className="p-6 lg:p-8">
          <PageHeader 
            title="Team"
            subtitle="Available in Operating and Growing stages"
            icon={Users}
          />
          <VOPSyInsight page="contractors" userContext={userContext} />
          <div style={{
            background: getCardGradient("#DC2626"), borderRadius: 12,
            border: getCardBorder("#DC2626"),
            padding: 48, textAlign: "center"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ color: C.text1, fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              This page is locked
            </div>
            <div style={{ color: C.text2, fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
              Team becomes available when you move to the Operating stage. 
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
    showToast('success', 'Team Member created successfully');
  };
  
  const handleDelete = () => {
    setItems(items.filter(item => item.id !== selectedItem?.id));
    setShowDeleteConfirm(false);
    setSelectedItem(null);
    showToast('success', 'Team Member deleted');
  };
  
  return (
    <div style={{ marginLeft: 220, minHeight: '100vh', background: C.bg }}>
      <Navigation />
      <main className="p-6 lg:p-8">
        <PageHeader 
          title="Team"
          subtitle="{isConnected ? 'Connected to Gusto' : 'Track manually or connect Gusto'}"
          icon={Users}
          action={{
            label: "Add Team Member",
            onClick: () => setShowCreateModal(true),
            color: "#E11D48"
          }}
        />
        
        <VOPSyInsight page="contractors" userContext={userContext} />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, borderBottom: '1px solid #1E293B' }}>
        {<button onClick={() => setActiveTab('Active')} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'Active' ? '2px solid #E11D48' : 'none', color: activeTab === 'Active' ? '#E11D48' : C.text2, fontWeight: activeTab === 'Active' ? 600 : 400, cursor: 'pointer' }}>Active</button>, <button onClick={() => setActiveTab('Documents')} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'Documents' ? '2px solid #E11D48' : 'none', color: activeTab === 'Documents' ? '#E11D48' : C.text2, fontWeight: activeTab === 'Documents' ? 600 : 400, cursor: 'pointer' }}>Documents</button>, <button onClick={() => setActiveTab('Archived')} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'Archived' ? '2px solid #E11D48' : 'none', color: activeTab === 'Archived' ? '#E11D48' : C.text2, fontWeight: activeTab === 'Archived' ? 600 : 400, cursor: 'pointer' }}>Archived</button>}
      </div>
        {items.length === 0 ? (
          <div style={{
            background: getCardGradient("#DC2626"), borderRadius: 12,
            border: getCardBorder("#DC2626"),
            padding: 48, textAlign: "center"
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ color: C.text1, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              No team members yet
            </div>
            <div style={{ color: C.text2, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              {isConnected 
                ? 'Data will appear after your first sync with Gusto.'
                : 'Add team members manually or connect Gusto to sync automatically.'
              }
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button 
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: getCardGradient("#DC2626"), color: "#fff", border: "none",
                  padding: "8px 18px", borderRadius: 8, fontWeight: 600,
                  fontSize: 13, cursor: "pointer"
                }}
              >
                Add Team Member
              </button>
              {!isConnected && (
                <button style={{
                  background: "transparent", color: C.accent,
                  border: `1px solid ${C.accent}`, padding: "8px 18px",
                  borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer"
                }}
                  onClick={() => window.location.href = '/integrations'}
                >
                  Connect Gusto →
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
                    background: 'transparent', border: getCardBorder("#DC2626"),
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
          title="Add Team Member"
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
