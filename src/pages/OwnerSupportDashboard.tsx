import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { Bell, Clock, CheckCircle, AlertCircle, MessageSquare, Phone, Video, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Escalation {
  id: string;
  user_name: string;
  user_email: string;
  summary: string;
  urgency: string;
  status: string;
  created_at: string;
  followup_count: number;
  vopsy_conversation: any;
}

interface Ticket {
  id: string;
  ticket_number: string;
  user_name: string;
  user_email: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  vopsy_conversation: any;
}

export default function OwnerSupportDashboard() {
  const { profile } = useAuth();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);

  useEffect(() => {
    if (profile?.role === 'owner') {
      fetchData();
      // Refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      // Fetch escalations
      const escRes = await fetch('/api/support/escalations');
      const escData = await escRes.json();
      setEscalations(escData.escalations || []);

      // Fetch tickets
      const ticketsRes = await fetch('/api/support/tickets');
      const ticketsData = await ticketsRes.json();
      setTickets(ticketsData.tickets || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching support data:', error);
      setLoading(false);
    }
  };

  const handleAcceptEscalation = async (escalationId: string, method: string) => {
    try {
      await fetch('/api/support/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalationId, connectionMethod: method }),
      });
      fetchData();
      setSelectedEscalation(null);
    } catch (error) {
      console.error('Error accepting escalation:', error);
    }
  };

  const pendingEscalations = escalations.filter(e => e.status === 'pending');
  const openTickets = tickets.filter(t => t.status === 'open');

  if (profile?.role !== 'owner') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Access denied. Owner only.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Support Dashboard</h1>
              <p className="text-muted-foreground">Manage escalations and support tickets</p>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Escalations</p>
                  <p className="text-3xl font-bold text-foreground">{pendingEscalations.length}</p>
                </div>
                <Bell className="text-red-500" size={32} />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Open Tickets</p>
                  <p className="text-3xl font-bold text-foreground">{openTickets.length}</p>
                </div>
                <MessageSquare className="text-blue-500" size={32} />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Active</p>
                  <p className="text-3xl font-bold text-foreground">
                    {pendingEscalations.length + openTickets.length}
                  </p>
                </div>
                <AlertCircle className="text-orange-500" size={32} />
              </div>
            </GlassCard>
          </div>

          {/* Pending Escalations (Priority) */}
          {pendingEscalations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Bell className="text-red-500" size={24} />
                Live Support Requests
              </h2>
              <div className="space-y-4">
                {pendingEscalations.map((esc) => (
                  <GlassCard key={esc.id} className="p-6 border-l-4 border-red-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{esc.user_name}</h3>
                          <span className="text-sm text-muted-foreground">{esc.user_email}</span>
                          {esc.urgency === 'high' && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                              HIGH URGENCY
                            </span>
                          )}
                        </div>
                        <p className="text-foreground mb-3">{esc.summary}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(esc.created_at).toLocaleTimeString()}
                          </span>
                          {esc.followup_count > 0 && (
                            <span className="text-orange-400">
                              {esc.followup_count} follow-up{esc.followup_count > 1 ? 's' : ''} sent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptEscalation(esc.id, 'chat')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <MessageSquare size={16} />
                        Chat Now
                      </button>
                      <button
                        onClick={() => handleAcceptEscalation(esc.id, 'zoom')}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        <Video size={16} />
                        Send Zoom Link
                      </button>
                      <button
                        onClick={() => handleAcceptEscalation(esc.id, 'phone')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Phone size={16} />
                        Call Them
                      </button>
                      <button
                        onClick={() => handleAcceptEscalation(esc.id, 'email')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <Mail size={16} />
                        Email
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Open Tickets */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Open Tickets</h2>
            {openTickets.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <CheckCircle className="mx-auto mb-3 text-green-500" size={48} />
                <p className="text-muted-foreground">No open tickets. Great job!</p>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {openTickets.map((ticket) => (
                  <GlassCard key={ticket.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-primary">{ticket.ticket_number}</span>
                          <h3 className="text-lg font-semibold text-foreground">{ticket.subject}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ticket.user_name} ({ticket.user_email})
                        </p>
                        <p className="text-foreground mb-3">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{ticket.category}</span>
                          <span>•</span>
                          <span>{new Date(ticket.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => window.location.href = `/tickets/${ticket.id}`}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
