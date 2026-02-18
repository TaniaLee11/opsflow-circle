import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllContactSources, deduplicateContacts, type UnifiedContact } from '@/services/unifiedData';
import { Users, Mail, Phone, Building2, Tag, Loader2, Plus, Search, Link as LinkIcon } from 'lucide-react';

export default function People() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<UnifiedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceCount, setSourceCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch from ALL connected sources (GHL, QuickBooks, Google, etc.)
      const sources = await fetchAllContactSources(user.id, user.user_metadata?.role || 'user');
      
      if (sources.length === 0) {
        // No integrations connected
        setIsConnected(false);
        setContacts([]);
        setSourceCount(0);
      } else {
        // Merge and deduplicate contacts from all sources
        const unified = deduplicateContacts(sources);
        setContacts(unified);
        setSourceCount(sources.length);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      (contact.phone || '').toLowerCase().includes(query) ||
      (contact.company || '').toLowerCase().includes(query)
    );
  });

  const leadsCount = contacts.filter(c => c.tags.some(t => t.toLowerCase().includes('lead'))).length;
  const withEmailCount = contacts.filter(c => c.email).length;

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Users className="text-primary" size={32} />
                People
              </h1>
              <p className="text-muted-foreground mt-1">
                {isConnected 
                  ? `Contacts from ${sourceCount} connected ${sourceCount === 1 ? 'source' : 'sources'}` 
                  : 'Connect your tools to see contacts'}
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <Plus size={18} />
              Add Contact
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : !isConnected ? (
          /* Empty State - No Integrations Connected */
          <GlassCard className="p-12 text-center">
            <LinkIcon className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Integrations Connected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your CRM, accounting software, or email to see all your contacts in one place.
            </p>
            <button 
              onClick={() => window.location.href = '/integrations'}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Connect Your Tools
            </button>
          </GlassCard>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {contacts.length}
                    </p>
                  </div>
                  <Users className="text-primary" size={24} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {leadsCount}
                    </p>
                  </div>
                  <Tag className="text-blue-500" size={24} />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">With Email</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {withEmailCount}
                    </p>
                  </div>
                  <Mail className="text-green-500" size={24} />
                </div>
              </GlassCard>
            </div>

            {/* Search */}
            <GlassCard className="p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search contacts by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </GlassCard>

            {/* Contacts List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Contacts
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
                </p>
              </div>

              {filteredContacts.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-muted-foreground">No contacts found matching your search.</p>
                </GlassCard>
              ) : (
                filteredContacts.map((contact) => (
                  <GlassCard key={contact.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {contact.name}
                          </h3>
                          {/* Source Badges */}
                          <div className="flex gap-1">
                            {contact.sources.map((source, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                                title={source.label}
                              >
                                {source.icon} {source.label}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail size={14} />
                              <span>{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone size={14} />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.company && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 size={14} />
                              <span>{contact.company}</span>
                            </div>
                          )}
                        </div>

                        {contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {contact.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
