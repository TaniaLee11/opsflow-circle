import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllEmailSources, deduplicateEmails, type UnifiedEmail } from '@/services/unifiedData';
import { Inbox as InboxIcon, Mail, Search, Filter, Plus, Loader2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Inbox() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<UnifiedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'important'>('all');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch from ALL connected email sources (Gmail, Outlook, etc.)
      const sources = await fetchAllEmailSources(user.id);
      
      if (sources.length === 0) {
        setIsConnected(false);
        setEmails([]);
      } else {
        const unified = deduplicateEmails(sources);
        setEmails(unified);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to load inbox data:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = searchQuery === '' || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Add filtering logic for tabs when we have read/important status
    return matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <InboxIcon className="text-primary" size={32} />
                Inbox
              </h1>
              <p className="text-muted-foreground mt-1">
                {isConnected 
                  ? 'Unified inbox from all connected email sources' 
                  : 'Connect your email to see messages'}
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <Plus size={18} />
              Compose
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : !isConnected ? (
          /* Empty State - No Email Connected */
          <GlassCard className="p-12 text-center">
            <LinkIcon className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Email Connected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your email (Gmail, Outlook, etc.) to see all your messages in one unified inbox.
            </p>
            <button 
              onClick={() => window.location.href = '/integrations'}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Connect Your Email
            </button>
          </GlassCard>
        ) : (
          <>
            {/* Search and Filters */}
            <GlassCard className="p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                  <Filter size={18} />
                  Filter
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activeTab === 'all'
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activeTab === 'unread'
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  Unread
                </button>
                <button
                  onClick={() => setActiveTab('important')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activeTab === 'important'
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  Important
                </button>
              </div>
            </GlassCard>

            {/* Email List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Messages
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredEmails.length} {filteredEmails.length === 1 ? 'email' : 'emails'}
                </p>
              </div>

              {filteredEmails.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <Mail className="mx-auto text-muted-foreground mb-2" size={32} />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No emails match your search.' : 'No emails found.'}
                  </p>
                </GlassCard>
              ) : (
                filteredEmails.map((email) => (
                  <GlassCard key={email.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="text-primary" size={16} />
                          <h3 className="text-lg font-semibold text-foreground">
                            {email.subject}
                          </h3>
                          {/* Source Badges */}
                          <div className="flex gap-1">
                            {email.sources.map((source, idx) => (
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
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-foreground font-medium">From: {email.from}</span>
                            <span className="text-muted-foreground">
                              {new Date(email.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {email.snippet}
                          </p>
                        </div>
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

// Helper function to fetch all email sources
async function fetchAllEmailSources(userId: string): Promise<{ provider: string; emails: any[] }[]> {
  const sources: { provider: string; emails: any[] }[] = [];

  // TODO: Implement user_integrations table in Supabase
  // For now, return empty array (will populate when OAuth is connected)
  
  return sources;
}
