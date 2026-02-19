import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Loader2, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  sources: { icon: string; label: string }[];
}

export default function Calendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedDate, viewMode]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch from ALL connected calendar sources (connected calendar sources)
      const sources = await fetchAllCalendarSources(user.id);
      
      if (sources.length === 0) {
        setIsConnected(false);
        setEvents([]);
      } else {
        const unified = deduplicateEvents(sources);
        setEvents(unified);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const selected = selectedDate;

    if (viewMode === 'day') {
      return eventDate.toDateString() === selected.toDateString();
    } else if (viewMode === 'week') {
      const weekStart = new Date(selected);
      weekStart.setDate(selected.getDate() - selected.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return eventDate >= weekStart && eventDate < weekEnd;
    } else {
      return eventDate.getMonth() === selected.getMonth() && 
             eventDate.getFullYear() === selected.getFullYear();
    }
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setSelectedDate(newDate);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <CalendarIcon className="text-cyan-500" size={32} />
                Calendar
              </h1>
              <p className="text-muted-foreground mt-1">
                {isConnected 
                  ? 'Unified calendar from all connected sources' 
                  : 'Connect your calendar to see events'}
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors">
              <Plus size={18} />
              Add Event
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : !isConnected ? (
          /* Empty State */
          <GlassCard className="p-12 text-center">
            <LinkIcon className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Calendar Connected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your connected calendar integrations to see all your events in one place.
            </p>
            <button 
              onClick={() => window.location.href = '/integrations'}
              className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
            >
              Connect Your Calendar
            </button>
          </GlassCard>
        ) : (
          <>
            {/* Calendar Controls */}
            <GlassCard className="p-4 mb-6">
              <div className="flex items-center justify-between">
                {/* Date Navigation */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateDate('prev')}
                    className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <h2 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
                    {viewMode === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    {viewMode === 'week' && `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    {viewMode === 'month' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  
                  <button
                    onClick={() => navigateDate('next')}
                    className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
                  >
                    Today
                  </button>
                </div>

                {/* View Mode Selector */}
                <div className="flex gap-2">
                  {(['day', 'week', 'month'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-colors capitalize",
                        viewMode === mode
                          ? "bg-cyan-600 text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Events List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Events
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                </p>
              </div>

              {filteredEvents.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <CalendarIcon className="mx-auto text-muted-foreground mb-2" size={32} />
                  <p className="text-muted-foreground">
                    No events scheduled for this period.
                  </p>
                </GlassCard>
              ) : (
                filteredEvents.map((event) => (
                  <GlassCard key={event.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarIcon className="text-cyan-500" size={16} />
                          <h3 className="text-lg font-semibold text-foreground">
                            {event.title}
                          </h3>
                          {/* Source Badges */}
                          <div className="flex gap-1">
                            {event.sources.map((source, idx) => (
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
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock size={14} />
                              {new Date(event.start).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit'
                              })}
                              {' - '}
                              {new Date(event.end).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit'
                              })}
                            </span>
                            
                            {event.location && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <MapPin size={14} />
                                {event.location}
                              </span>
                            )}
                            
                            {event.attendees && event.attendees.length > 0 && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Users size={14} />
                                {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                              </span>
                            )}
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {event.description}
                            </p>
                          )}
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

// Helper functions
async function fetchAllCalendarSources(userId: string): Promise<{ provider: string; events: any[] }[]> {
  const sources: { provider: string; events: any[] }[] = [];
  // TODO: Implement user_integrations table and fetch from connected calendar sources
  return sources;
}

function deduplicateEvents(sources: { provider: string; events: any[] }[]): CalendarEvent[] {
  const eventMap = new Map<string, CalendarEvent>();
  
  sources.forEach((source) => {
    source.events.forEach((event: any) => {
      const key = `${event.title}-${event.start}`;
      
      if (!eventMap.has(key)) {
        eventMap.set(key, {
          id: event.id,
          title: event.title,
          description: event.description,
          start: event.start,
          end: event.end,
          location: event.location,
          attendees: event.attendees,
          sources: [{ icon: '📅', label: source.provider }],
        });
      } else {
        // Merge sources
        const existing = eventMap.get(key)!;
        existing.sources.push({ icon: '📅', label: source.provider });
      }
    });
  });
  
  return Array.from(eventMap.values()).sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );
}
