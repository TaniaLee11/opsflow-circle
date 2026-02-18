import { useState } from 'react';
import { C, getCardGradient, getCardBorder, cardBaseStyles } from "@/components/shared/theme";
import { Navigation } from '@/components/layout/Navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { VOPSyInsight } from '@/components/shared/VOPSyInsight';
import { CreateModal } from '@/components/shared/CreateModal';
import { DeleteConfirm } from '@/components/shared/DeleteConfirm';
import { useToast } from '@/components/shared/Toast';
import { DollarSign } from 'lucide-react';


export default function Payroll() {
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
  const isConnected = userContext.integrations.includes('gusto');

  if (userContext.stage === 'foundations') {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 p-6 lg:p-8">
          <PageHeader 
            title="Payroll"
            subtitle="Available in Operating and Growing stages"
            icon={DollarSign}
          />
          <VOPSyInsight page="payroll" userContext={userContext} />
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
              Payroll becomes available when you move to the Operating stage. 
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
    showToast('success', 'Payroll Run created successfully');
  };
  
  const handleDelete = () => {
    setItems(items.filter(item => item.id !== selectedItem?.id));
    setShowDeleteConfirm(false);
    setSelectedItem(null);
    showToast('success', 'Payroll Run deleted');
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-6 lg:p-8">
        <PageHeader 
          title="Payroll"
          subtitle="{isConnected ? 'Connected to Gusto' : 'Track manually or connect Gusto'}"
          icon={DollarSign}
          action={{
            label: "Add Payroll Run",
            onClick: () => setShowCreateModal(true),
            color: "#E11D48"
          }}
        />
        
        <VOPSyInsight page="payroll" userContext={userContext} />

        {items.length === 0 ? (
          <div style={{
            background: getCardGradient("#DC2626"), borderRadius: 12,
            border: getCardBorder("#DC2626"),
            padding: 48, textAlign: "center"
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ color: C.text1, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              No payroll runs yet
            </div>
            <div style={{ color: C.text2, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              {isConnected 
                ? 'Data will appear after your first sync with Gusto.'
                : 'Add payroll runs manually or connect Gusto to sync automatically.'
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
                Add Payroll Run
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
          title="Add Payroll Run"
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
