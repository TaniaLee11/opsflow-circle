import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  attendees?: string[];
  isAllDay: boolean;
  status: 'confirmed' | 'tentative' | 'cancelled';
  organizer?: string;
  meetingLink?: string;
}

export interface CalendarData {
  provider: string;
  connectedAccount: string;
  events: CalendarEvent[];
  upcomingCount: number;
  todayCount: number;
}

export interface CalendarStatus {
  connected: boolean;
  provider?: string;
  connectedAccount?: string;
  error?: string;
  message?: string;
}

export const CALENDAR_KEYWORDS = [
  'calendar', 'schedule', 'meeting', 'meetings', 'appointment', 'appointments',
  'event', 'events', 'agenda', 'today', 'tomorrow', 'this week', 'upcoming',
  'free time', 'availability', 'busy', 'when am i', 'what do i have'
];

export function useCalendarIntelligence() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [data, setData] = useState<CalendarData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch calendar data
  const fetchCalendarData = useCallback(async (): Promise<CalendarData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('calendar-fetch', {});

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch calendar');
      }

      if (!result.connected) {
        setStatus({ connected: false, message: result.message, error: result.error });
        return null;
      }

      const calendarData = result.data as CalendarData;
      setData(calendarData);
      setStatus({
        connected: true,
        provider: calendarData.provider,
        connectedAccount: calendarData.connectedAccount,
      });

      return calendarData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Calendar fetch failed';
      setError(errorMsg);
      setStatus({ connected: false, error: errorMsg });
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format time for display
  const formatEventTime = useCallback((event: CalendarEvent): string => {
    if (event.isAllDay) {
      return 'All day';
    }
    
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    };
    
    return `${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
  }, []);

  // Format date for display
  const formatEventDate = useCallback((dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }, []);

  // Format calendar data for chat display
  const formatCalendarForChat = useCallback((calendarData: CalendarData): string => {
    const lines: string[] = [];
    
    lines.push(`📅 **Calendar Intelligence Report**`);
    lines.push(`Connected to: **${calendarData.connectedAccount}** (${calendarData.provider})`);
    lines.push(`Synced: ${new Date().toLocaleTimeString()}`);
    lines.push('');

    if (calendarData.events.length === 0) {
      lines.push(`✨ **Your calendar is clear!** No upcoming events in the next 7 days.`);
      lines.push('');
      lines.push(`Would you like me to help you schedule something?`);
      return lines.join('\n');
    }

    // Summary
    lines.push(`📊 **Summary:** ${calendarData.todayCount} events today, ${calendarData.upcomingCount} total this week`);
    lines.push('');

    // Group events by date
    const eventsByDate = new Map<string, CalendarEvent[]>();
    
    for (const event of calendarData.events) {
      const dateKey = formatEventDate(event.start);
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);
    }

    // Display events grouped by date
    for (const [dateLabel, events] of eventsByDate) {
      lines.push('---');
      const emoji = dateLabel === 'Today' ? '🔴' : dateLabel === 'Tomorrow' ? '🟡' : '🟢';
      lines.push(`${emoji} **${dateLabel}**`);
      
      for (const event of events) {
        const time = formatEventTime(event);
        const status = event.status === 'tentative' ? ' *(tentative)*' : '';
        
        lines.push(`• **${time}** — ${event.title}${status}`);
        
        if (event.location) {
          lines.push(`   📍 ${event.location}`);
        }
        
        if (event.meetingLink) {
          lines.push(`   🔗 [Join Meeting](${event.meetingLink})`);
        }
        
        if (event.attendees && event.attendees.length > 0) {
          const attendeeCount = event.attendees.length;
          if (attendeeCount <= 3) {
            lines.push(`   👥 ${event.attendees.join(', ')}`);
          } else {
            lines.push(`   👥 ${event.attendees.slice(0, 2).join(', ')} +${attendeeCount - 2} more`);
          }
        }
      }
      lines.push('');
    }

    // Action suggestions
    lines.push('---');
    lines.push('💬 **What would you like to do?**');
    lines.push('• Ask "What meetings do I have today?"');
    lines.push('• Ask "When am I free this week?"');
    lines.push('• Ask "Tell me about my next meeting"');

    return lines.join('\n');
  }, [formatEventDate, formatEventTime]);

  // Get today's events
  const getTodayEvents = useCallback((): CalendarEvent[] => {
    if (!data) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return data.events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate >= today && eventDate < tomorrow;
    });
  }, [data]);

  // Get next event
  const getNextEvent = useCallback((): CalendarEvent | null => {
    if (!data || data.events.length === 0) return null;
    
    const now = new Date();
    
    for (const event of data.events) {
      const eventStart = new Date(event.start);
      if (eventStart > now) {
        return event;
      }
    }
    
    return null;
  }, [data]);

  // Format a single event for display
  const formatSingleEventForChat = useCallback((event: CalendarEvent): string => {
    const lines: string[] = [];
    
    lines.push(`📅 **${event.title}**`);
    lines.push('');
    lines.push(`🕐 **When:** ${formatEventDate(event.start)}, ${formatEventTime(event)}`);
    
    if (event.location) {
      lines.push(`📍 **Where:** ${event.location}`);
    }
    
    if (event.meetingLink) {
      lines.push(`🔗 **Meeting Link:** [Join here](${event.meetingLink})`);
    }
    
    if (event.attendees && event.attendees.length > 0) {
      lines.push(`👥 **Attendees:** ${event.attendees.join(', ')}`);
    }
    
    if (event.organizer) {
      lines.push(`👤 **Organizer:** ${event.organizer}`);
    }
    
    if (event.description) {
      lines.push('');
      lines.push(`📝 **Description:** ${event.description}`);
    }
    
    if (event.status === 'tentative') {
      lines.push('');
      lines.push(`⚠️ *This event is tentative*`);
    }

    return lines.join('\n');
  }, [formatEventDate, formatEventTime]);

  return {
    isLoading,
    status,
    data,
    error,
    fetchCalendarData,
    formatCalendarForChat,
    formatSingleEventForChat,
    getTodayEvents,
    getNextEvent,
    formatEventTime,
    formatEventDate,
  };
}
