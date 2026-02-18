import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from '@/components/ui/glass-card';
import { ghlService, type GHLContact } from '@/services/ghl';
import { Users, Mail, Phone, Building2, Tag, Loader2, Plus, Search } from 'lucide-react';

export default function People() {
  const [contacts, setContacts] = useState<GHLContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const [contactsData, count] = await Promise.all([
        ghlService.getContacts(100),
        ghlService.getContactCount(),
      ]);
      
      setContacts(contactsData);
      setTotalCount(count);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const name = ghlService.getContactName(contact).toLowerCase();
    const email = (contact.email || '').toLowerCase();
    const phone = (contact.phone || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || email.includes(query) || phone.includes(query);
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 ml-[220px] p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Users className="text-primary" size={32} />
                People
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage contacts from GoHighLevel
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
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {totalCount}
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
                      {contacts.filter(c => c.type === 'lead').length}
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
                      {contacts.filter(c => c.email).length}
                    </p>
                  </div>
                  <Mail className="text-green-500" size={24} />
                </div>
              </GlassCard>
            </div>

            {/* Search */}
            <GlassCard className="mb-6 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search contacts by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </GlassCard>

            {/* Contacts List */}
            {filteredContacts.length > 0 ? (
              <GlassCard>
                <GlassCardHeader>
                  <GlassCardTitle>Contacts</GlassCardTitle>
                  <GlassCardDescription>
                    {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-3">
                    {filteredContacts.map(contact => (
                      <div
                        key={contact.id}
                        className="flex items-start justify-between p-4 rounded-lg bg-card/30 border border-border/30 hover:bg-card/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground">
                            {ghlService.getContactName(contact)}
                          </h5>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            {contact.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail size={14} />
                                <span>{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone size={14} />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                            {contact.companyName && (
                              <div className="flex items-center gap-1.5">
                                <Building2 size={14} />
                                <span>{contact.companyName}</span>
                              </div>
                            )}
                          </div>
                          {contact.tags && contact.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {contact.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            contact.type === 'lead' 
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              : 'bg-green-500/10 text-green-500 border border-green-500/20'
                          }`}>
                            {contact.type || 'contact'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>
            ) : (
              <GlassCard className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchQuery ? 'No contacts found' : 'No Contacts Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No contacts match "${searchQuery}"`
                    : 'Connect your GoHighLevel account to see your contacts.'
                  }
                </p>
              </GlassCard>
            )}
          </>
        )}
      </main>
    </div>
  );
}
