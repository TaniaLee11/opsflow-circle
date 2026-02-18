import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { fetchAllContacts } from '@/services/integrationFetcher';
import { deduplicateContacts, type UnifiedContact } from '@/services/dataUnifier';
import { Users, Mail, Phone, Building2, Tag, Loader2, Plus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function People() {
  const { user, profile } = useAuth();
  const [contacts, setContacts] = useState<UnifiedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [connected, setConnected] = useState(false);
  const [sourceCount, setSourceCount] = useState(0);

  useEffect(() => {
    if (user && profile) {
      loadContacts();
    }
  }, [user, profile]);

  const loadContacts = async () => {
    if (!user || !profile) return;
    
    setLoading(true);
    try {
      // Fetch from ALL connected sources
      const sources = await fetchAllContacts(user.id, profile.role);
      
      if (sources.length > 0) {
        // Merge and deduplicate
        const unified = deduplicateContacts(sources);
        setContacts(unified);
        setConnected(true);
        setSourceCount(sources.length);
      } else {
        setConnected(false);
        setContacts([]);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const name = contact.name.toLowerCase();
    const email = (contact.email || '').toLowerCase();
    const phone = (contact.phone || '').toLowerCase();
    const company = (contact.company || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || email.includes(query) || phone.includes(query) || company.includes(query);
  });

  const contactsWithEmail = contacts.filter(c => c.email);
  const leadContacts = contacts.filter(c => c.tags.includes('lead'));

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
                {connected 
                  ? `Contacts from ${sourceCount} connected ${sourceCount === 1 ? 'source' : 'sources'}`
                  : 'Manage your contacts'}
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
        ) : !connected ? (
          /* Empty State - Not Connected */
          <div className="flex flex-col items-center justify-center h-96">
            <GlassCard className="max-w-md text-center p-8">
              <Users className="mx-auto text-muted-foreground mb-4" size={48} />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Contacts Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Add contacts manually or connect your business tools to sync automatically.
              </p>
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  <Plus size={18} />
                  Add Contact Manually
                </button>
                <button 
                  onClick={() => window.location.href = '/integrations'}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-transparent text-primary border border-primary/30 rounded-lg font-medium hover:bg-primary/10 transition-colors"
                >
                  Connect Your Tools →
                </button>
              </div>
            </GlassCard>
          </div>
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
                      {leadContacts.length}
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
                      {contactsWithEmail.length}
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
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Contacts
                <span className="text-sm text-muted-foreground ml-2">
                  {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
                </span>
              </h3>

              <div className="space-y-3">
                {filteredContacts.map((contact) => (
                  <GlassCard key={contact.id} className="p-4 hover:bg-background/80 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-foreground">
                          {contact.name}
                        </h4>
                        
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          {contact.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              {contact.phone}
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              {contact.email}
                            </div>
                          )}
                          {contact.company && (
                            <div className="flex items-center gap-1">
                              <Building2 size={14} />
                              {contact.company}
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {contact.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Source Badges */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {contact.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded-md bg-background/60 text-muted-foreground border border-border"
                            >
                              {source.icon} {source.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <span className="text-xs text-blue-500 font-medium px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        {contact.tags.includes('lead') ? 'lead' : 'contact'}
                      </span>
                    </div>
                  </GlassCard>
                ))}

                {filteredContacts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No contacts found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
