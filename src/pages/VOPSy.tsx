import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Send, 
  MessageSquare,
  ListTodo,
  Calendar,
  Mail,
  Zap,
  RefreshCw,
  Loader2,
  TrendingUp,
  FileText,
  Target,
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  Link
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { AccessGate } from "@/components/access/AccessGate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVOPSyChat, ChatMessage } from "@/hooks/useVOPSyChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useInboxIntelligence } from "@/hooks/useInboxIntelligence";
import { useFinancialIntelligence } from "@/hooks/useFinancialIntelligence";
import { useCalendarIntelligence, CALENDAR_KEYWORDS } from "@/hooks/useCalendarIntelligence";
import { useTaskIntelligence, TASK_KEYWORDS, PROJECT_KEYWORDS, CALENDAR_ACTION_KEYWORDS } from "@/hooks/useTaskIntelligence";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { VOPSyMascot } from "@/components/brand/VOPSyMascot";

// Keywords that trigger inbox intelligence
const INBOX_KEYWORDS = ['inbox', 'email', 'emails', 'mail', 'messages', 'unread'];

// Keywords that trigger financial intelligence
const FINANCIAL_KEYWORDS = ['cash flow', 'cashflow', 'invoices', 'invoice', 'receivables', 'financial', 'finances', 'balance', 'revenue', 'payments', 'overdue', 'stripe', 'quickbooks', 'xero', 'accounting', 'money'];

const quickActions = [
  { icon: TrendingUp, label: "Cash flow analysis", prompt: "Show me my current cash flow and financial position from my connected accounts", category: "Finance", isFinancial: true },
  { icon: Mail, label: "Check my inbox", prompt: "Go ahead — scan my real inbox and show me what needs attention", category: "Operations", isInbox: true },
  { icon: Calendar, label: "Check my calendar", prompt: "Show me my calendar and upcoming meetings for this week", category: "Operations", isCalendar: true },
  { icon: ListTodo, label: "Today's priorities", prompt: "What should be my top priorities today? Give me a strategic assessment.", category: "Strategy" },
  { icon: Zap, label: "Automate workflow", prompt: "Suggest automations for my repetitive tasks. What processes can I optimize?", category: "Operations" },
  { icon: FileText, label: "Tax planning", prompt: "Help me with tax planning. What are my estimated quarterly taxes and upcoming deadlines?", category: "Finance" },
  { icon: Target, label: "Marketing insights", prompt: "Give me marketing insights. How are my campaigns performing and what should I focus on?", category: "Marketing" },
  { icon: BookOpen, label: "Learning path", prompt: "Recommend a learning path for me based on my business needs", category: "Education" },
];

// Simple markdown-like formatting
function formatMessage(content: string) {
  // Split by double newlines for paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  return paragraphs.map((para, pIdx) => {
    // Handle bullet points
    if (para.includes('\n•') || para.startsWith('•')) {
      const lines = para.split('\n');
      return (
        <div key={pIdx} className="space-y-1">
          {lines.map((line, lIdx) => {
            if (line.startsWith('•')) {
              return (
                <div key={lIdx} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{formatInlineText(line.slice(1).trim())}</span>
                </div>
              );
            }
            return <p key={lIdx}>{formatInlineText(line)}</p>;
          })}
        </div>
      );
    }
    
    // Regular paragraph
    return <p key={pIdx} className="mb-2 last:mb-0">{formatInlineText(para)}</p>;
  });
}

function formatInlineText(text: string) {
  // Handle **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function VOPSy() {
  const { messages, isLoading, sendMessage, clearHistory, addAssistantMessage } = useVOPSyChat();
  const [input, setInput] = useState("");
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Inbox intelligence hook
  const { 
    analyzeInbox, 
    formatAnalysisForChat, 
    formatSingleEmailForChat,
    draftReply,
    sendDraft,
    clearDraft,
    formatDraftForChat,
    getEmailByNumber,
    findEmailByKeyword,
    getAllEmailsInOrder,
    analysis: currentAnalysis,
    currentDraft,
    status: inboxStatus 
  } = useInboxIntelligence();

  // Email navigation state
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [isViewingEmails, setIsViewingEmails] = useState(false);

  // Financial intelligence hook
  const {
    fetchFinancialData,
    formatFinancialForChat,
    isLoading: isFinancialLoading,
    status: financialStatus,
  } = useFinancialIntelligence();

  // Calendar intelligence hook
  const {
    fetchCalendarData,
    formatCalendarForChat,
    formatSingleEventForChat,
    getTodayEvents,
    getNextEvent,
    isLoading: isCalendarFetching,
    data: calendarData,
  } = useCalendarIntelligence();

  // Task intelligence hook
  const {
    createTask,
    updateTask,
    createProject,
    createCalendarEvent,
    fetchTasks,
    fetchProjects,
    formatTasksForChat,
    formatProjectsForChat,
    isLoading: isTaskLoading,
  } = useTaskIntelligence();
  const {
    isListening,
    isSupported: isVoiceSupported,
    interimTranscript,
    error: voiceError,
    toggleListening,
    stopListening,
  } = useVoiceInput({
    onTranscript: (text) => {
      if (text.trim()) {
        setInput(prev => prev + (prev ? ' ' : '') + text);
      }
    },
    onInterimTranscript: (text) => {
      console.log('Interim:', text);
    },
  });

  // Check if message is inbox-related
  const isInboxRequest = useCallback((text: string) => {
    const lower = text.toLowerCase();
    return INBOX_KEYWORDS.some(kw => lower.includes(kw)) && 
           (lower.includes('check') || lower.includes('scan') || lower.includes('go ahead') || 
            lower.includes('show') || lower.includes('analyze') || lower.includes('summarize') ||
            lower.includes('what') || lower.includes('need'));
  }, []);

  // Check if message is financial-related
  const isFinancialRequest = useCallback((text: string) => {
    const lower = text.toLowerCase();
    return FINANCIAL_KEYWORDS.some(kw => lower.includes(kw)) && 
           (lower.includes('show') || lower.includes('what') || lower.includes('analyze') || 
            lower.includes('check') || lower.includes('my') || lower.includes('current') ||
            lower.includes('how much') || lower.includes('position'));
  }, []);

  // Check if message is calendar-related
  const isCalendarRequest = useCallback((text: string) => {
    const lower = text.toLowerCase();
    return CALENDAR_KEYWORDS.some(kw => lower.includes(kw)) && 
           (lower.includes('show') || lower.includes('what') || lower.includes('check') || 
            lower.includes('my') || lower.includes('do i have') || lower.includes('upcoming') ||
            lower.includes('next') || lower.includes('when') || lower.includes('schedule') ||
            lower.includes('today') || lower.includes('tomorrow') || lower.includes('week'));
  }, []);

  // Check if message is a task action request
  const isTaskActionRequest = useCallback((text: string): { isAction: boolean; action?: string; details?: string } => {
    const lower = text.toLowerCase();
    
    // Create task patterns
    if (lower.includes('add task') || lower.includes('create task') || lower.includes('new task') || 
        (lower.includes('remind') && (lower.includes('me to') || lower.includes('to '))) ||
        lower.match(/^task[:\s]/)) {
      // Extract task title
      let title = text;
      const patterns = [
        /(?:add|create|new)\s+task[:\s]+(.+)/i,
        /task[:\s]+(.+)/i,
        /remind\s+(?:me\s+)?to\s+(.+)/i,
      ];
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          title = match[1].trim();
          break;
        }
      }
      return { isAction: true, action: 'create_task', details: title };
    }

    // Create project patterns
    if (lower.includes('add project') || lower.includes('create project') || lower.includes('new project') ||
        lower.match(/^project[:\s]/)) {
      let name = text;
      const patterns = [
        /(?:add|create|new)\s+project[:\s]+(.+)/i,
        /project[:\s]+(.+)/i,
      ];
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          name = match[1].trim();
          break;
        }
      }
      return { isAction: true, action: 'create_project', details: name };
    }

    // Create calendar event patterns
    if (CALENDAR_ACTION_KEYWORDS.some(kw => lower.includes(kw))) {
      // Try to extract event details
      const eventPatterns = [
        /(?:schedule|add|create|book|set up)\s+(?:a\s+)?(?:meeting|event|call)?\s*(?:with\s+)?(.+?)(?:\s+(?:for|on|at)\s+(.+))?$/i,
        /(?:add|put)\s+(?:it\s+)?(?:on|to)\s+(?:my\s+)?calendar[:\s]*(.+)?/i,
      ];
      let details = text;
      for (const pattern of eventPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          details = match[1].trim();
          if (match[2]) details += ' ' + match[2].trim();
          break;
        }
      }
      return { isAction: true, action: 'create_calendar_event', details };
    }

    // View tasks
    if ((lower.includes('show') || lower.includes('list') || lower.includes('my')) && 
        (lower.includes('task') || lower.includes('to-do') || lower.includes('todo'))) {
      return { isAction: true, action: 'view_tasks' };
    }

    // View projects
    if ((lower.includes('show') || lower.includes('list') || lower.includes('my')) && lower.includes('project')) {
      return { isAction: true, action: 'view_projects' };
    }

    return { isAction: false };
  }, []);
  const isDraftRequest = useCallback((text: string): { isDraft: boolean; emailNum?: number; keyword?: string; tone?: 'professional' | 'friendly' | 'brief' | 'detailed' } => {
    const lower = text.toLowerCase();
    
    if (!lower.includes('draft') && !lower.includes('reply') && !lower.includes('respond')) {
      return { isDraft: false };
    }

    // Extract email number (e.g., "draft reply to #1" or "reply to 2")
    const numMatch = lower.match(/(?:#|number\s*)?(\d+)/);
    const emailNum = numMatch ? parseInt(numMatch[1], 10) : undefined;

    // Detect tone
    let tone: 'professional' | 'friendly' | 'brief' | 'detailed' | undefined;
    if (lower.includes('friendly') || lower.includes('casual') || lower.includes('warm')) {
      tone = 'friendly';
    } else if (lower.includes('brief') || lower.includes('short') || lower.includes('concise')) {
      tone = 'brief';
    } else if (lower.includes('detailed') || lower.includes('thorough') || lower.includes('comprehensive')) {
      tone = 'detailed';
    } else {
      tone = 'professional';
    }

    // If no number, try to find a keyword
    let keyword: string | undefined;
    if (!emailNum) {
      // Common patterns: "reply to the invoice email", "draft response to meeting request"
      const keywordPatterns = [
        /(?:reply|respond|draft)\s+(?:to\s+)?(?:the\s+)?(.+?)(?:\s+email)?$/,
        /(?:about|regarding)\s+(.+)$/,
      ];
      for (const pattern of keywordPatterns) {
        const match = lower.match(pattern);
        if (match && match[1] && match[1].length > 2) {
          keyword = match[1].trim();
          break;
        }
      }
    }

    return { isDraft: true, emailNum, keyword, tone };
  }, []);

  // Check if message is a send request
  const isSendRequest = useCallback((text: string): boolean => {
    const lower = text.toLowerCase();
    const sendPatterns = [
      'send it', 'send this', 'send the email', 'send the reply', 'send the draft',
      'go ahead and send', 'yes send', 'please send', 'send now', 'ship it',
      'looks good send', 'send away', 'fire it off', 'deliver it'
    ];
    return sendPatterns.some(pattern => lower.includes(pattern));
  }, []);

  // Handle send request
  const handleSendRequest = useCallback(async () => {
    if (!currentDraft) {
      addAssistantMessage(`📝 I don't have a draft ready to send. Would you like me to draft a reply to one of your emails first?`);
      return;
    }

    setIsSendingEmail(true);
    addAssistantMessage(`📤 Sending your reply...`);

    const result = await sendDraft();
    
    if (result.success) {
      addAssistantMessage(`✅ **Email sent successfully!**

Your reply has been delivered. Is there anything else you'd like me to help with?

• Check for more emails to respond to
• Draft another reply
• Something else entirely`);
    } else {
      addAssistantMessage(`❌ **Couldn't send the email**

${result.error || 'An unexpected error occurred.'}

Would you like me to try again, or would you prefer to make changes to the draft first?`);
    }

    setIsSendingEmail(false);
  }, [currentDraft, sendDraft, addAssistantMessage]);

  // Handle draft request
  const handleDraftRequest = useCallback(async (emailNum?: number, keyword?: string, tone: 'professional' | 'friendly' | 'brief' | 'detailed' = 'professional') => {
    if (!currentAnalysis) {
      addAssistantMessage(`📭 I don't have any emails loaded yet. Let me check your inbox first...`);
      await handleInboxRequest();
      return;
    }

    // Find the email
    let email = emailNum ? getEmailByNumber(emailNum) : null;
    if (!email && keyword) {
      email = findEmailByKeyword(keyword);
    }

    if (!email) {
      addAssistantMessage(`🤔 I couldn't find that email. Try saying "draft reply to #1" with a number from the inbox report, or mention a keyword from the email subject.`);
      return;
    }

    setIsDrafting(true);
    addAssistantMessage(`✍️ Drafting a ${tone} reply to "${email.subject}"...`);

    const draft = await draftReply(email, tone);
    
    if (draft) {
      const formattedDraft = formatDraftForChat(draft, email.subject);
      addAssistantMessage(formattedDraft);
    } else {
      addAssistantMessage(`❌ Sorry, I had trouble drafting that reply. Please try again.`);
    }

    setIsDrafting(false);
  }, [currentAnalysis, getEmailByNumber, findEmailByKeyword, draftReply, formatDraftForChat, addAssistantMessage]);

  // Handle inbox analysis with real data
  const handleInboxRequest = useCallback(async () => {
    setIsInboxLoading(true);
    
    const analysis = await analyzeInbox();
    
    if (!analysis) {
      // Not connected - provide helpful message
      const notConnectedMsg = `🔐 **Inbox Access Check**

I'd love to scan your real inbox, but I don't have access yet!

To enable **Inbox Intelligence**, you'll need to connect your email account:
• **Google Workspace** — Gmail, Calendar, Drive
• **Microsoft 365** — Outlook, Teams, OneDrive

👉 **[Go to Integrations](/integrations)** to connect your email account.

Once connected, I'll be able to:
• Scan your unread and flagged emails
• Identify messages that need a reply or decision  
• Group them by priority (🔴 Urgent, 🟡 Needs Response, 🟢 FYI)
• Give you plain-English summaries
• Draft replies when you're ready

Want me to help with something else in the meantime?`;
      
      addAssistantMessage(notConnectedMsg);
    } else {
      // Connected - show real analysis
      const formattedAnalysis = formatAnalysisForChat(analysis);
      addAssistantMessage(formattedAnalysis);
    }
    
    setIsInboxLoading(false);
  }, [analyzeInbox, formatAnalysisForChat, addAssistantMessage]);

  // Handle financial data request
  const handleFinancialRequest = useCallback(async () => {
    addAssistantMessage(`💰 Fetching your financial data...`);
    
    const financialData = await fetchFinancialData();
    
    if (!financialData) {
      const notConnectedMsg = `🔐 **Financial Access Check**

I'd love to show you real financial data, but I don't have access yet!

To enable **Financial Intelligence**, connect one or more of these accounts:
• **QuickBooks** — Invoices, expenses, reports
• **Stripe** — Payments, subscriptions, balances
• **Xero** — Accounting, invoices, bank reconciliation

👉 **[Go to Integrations](/integrations)** to connect your financial accounts.

Once connected, I'll be able to:
• Show your real-time cash position
• List unpaid and overdue invoices
• Track recent payments and transactions
• Alert you to financial action items

Would you like help with something else?`;
      
      addAssistantMessage(notConnectedMsg);
    } else {
      const formattedFinancial = formatFinancialForChat(financialData);
      addAssistantMessage(formattedFinancial);
    }
  }, [fetchFinancialData, formatFinancialForChat, addAssistantMessage]);

  // Handle calendar data request
  const handleCalendarRequest = useCallback(async () => {
    setIsCalendarLoading(true);
    addAssistantMessage(`📅 Checking your calendar...`);
    
    const calendar = await fetchCalendarData();
    
    if (!calendar) {
      const notConnectedMsg = `🔐 **Calendar Access Check**

I'd love to show you your schedule, but I don't have access yet!

To enable **Calendar Intelligence**, connect one of these accounts:
• **Google Workspace** — Google Calendar
• **Microsoft 365** — Outlook Calendar

👉 **[Go to Integrations](/integrations)** to connect your calendar.

Once connected, I'll be able to:
• Show your upcoming meetings and events
• Tell you what's on your schedule today
• Alert you to busy times and conflicts
• Help you find free time for new meetings

Would you like help with something else?`;
      
      addAssistantMessage(notConnectedMsg);
    } else {
      const formattedCalendar = formatCalendarForChat(calendar);
      addAssistantMessage(formattedCalendar);
    }
    
    setIsCalendarLoading(false);
  }, [fetchCalendarData, formatCalendarForChat, addAssistantMessage]);

  // Handle task action request
  const handleTaskActionRequest = useCallback(async (action: string, details?: string) => {
    switch (action) {
      case 'create_task': {
        if (!details) {
          addAssistantMessage(`📝 What task would you like me to add? Just say "add task [your task title]"`);
          return;
        }
        
        addAssistantMessage(`📝 Creating task: "${details}"...`);
        
        // Parse for priority and due date from details
        let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
        let dueDate: string | undefined;
        
        const lowerDetails = details.toLowerCase();
        if (lowerDetails.includes('urgent') || lowerDetails.includes('asap')) {
          priority = 'urgent';
        } else if (lowerDetails.includes('high priority') || lowerDetails.includes('important')) {
          priority = 'high';
        } else if (lowerDetails.includes('low priority')) {
          priority = 'low';
        }

        // Parse simple date references
        const now = new Date();
        if (lowerDetails.includes('today')) {
          dueDate = now.toISOString();
        } else if (lowerDetails.includes('tomorrow')) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          dueDate = tomorrow.toISOString();
        } else if (lowerDetails.includes('next week')) {
          const nextWeek = new Date(now);
          nextWeek.setDate(nextWeek.getDate() + 7);
          dueDate = nextWeek.toISOString();
        }

        const result = await createTask({ 
          title: details.replace(/\b(urgent|asap|high priority|important|low priority|today|tomorrow|next week)\b/gi, '').trim(),
          priority,
          due_date: dueDate,
        });
        
        if (result.success) {
          addAssistantMessage(`✅ **Task created!**

"${details}" has been added to your tasks.
${priority !== 'medium' ? `Priority: **${priority}**` : ''}
${dueDate ? `Due: **${new Date(dueDate).toLocaleDateString()}**` : ''}

Would you like me to:
• Add another task
• Show your task list
• Add this to your calendar too?`);
        } else {
          addAssistantMessage(`❌ Couldn't create task: ${result.error}`);
        }
        break;
      }

      case 'create_project': {
        if (!details) {
          addAssistantMessage(`📁 What project would you like me to create? Just say "create project [project name]"`);
          return;
        }
        
        addAssistantMessage(`📁 Creating project: "${details}"...`);
        
        const result = await createProject({ name: details });
        
        if (result.success) {
          addAssistantMessage(`✅ **Project created!**

"${details}" has been added to your projects.

Would you like me to:
• Add tasks to this project
• Show your project list
• Create another project?`);
        } else {
          addAssistantMessage(`❌ Couldn't create project: ${result.error}`);
        }
        break;
      }

      case 'create_calendar_event': {
        if (!details) {
          addAssistantMessage(`📅 What would you like me to add to your calendar? 
          
Please include:
• Event title
• Date and time (e.g., "tomorrow at 2pm")
• Duration or end time

Example: "Schedule a meeting with John tomorrow at 2pm for 1 hour"`);
          return;
        }
        
        addAssistantMessage(`📅 Adding to calendar: "${details}"...`);
        
        // Simple date/time parsing
        const now = new Date();
        let startDate = new Date(now);
        let endDate = new Date(now);
        
        const lowerDetails = details.toLowerCase();
        
        // Parse date
        if (lowerDetails.includes('tomorrow')) {
          startDate.setDate(startDate.getDate() + 1);
          endDate.setDate(endDate.getDate() + 1);
        } else if (lowerDetails.includes('next week')) {
          startDate.setDate(startDate.getDate() + 7);
          endDate.setDate(endDate.getDate() + 7);
        }
        
        // Parse time
        const timeMatch = lowerDetails.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const ampm = timeMatch[3]?.toLowerCase();
          
          if (ampm === 'pm' && hours < 12) hours += 12;
          if (ampm === 'am' && hours === 12) hours = 0;
          
          startDate.setHours(hours, minutes, 0, 0);
          endDate.setHours(hours + 1, minutes, 0, 0); // Default 1 hour duration
        } else {
          // Default to 10am if no time specified
          startDate.setHours(10, 0, 0, 0);
          endDate.setHours(11, 0, 0, 0);
        }
        
        // Parse duration
        const durationMatch = lowerDetails.match(/for\s+(\d+)\s*(hour|hr|minute|min)/i);
        if (durationMatch) {
          const amount = parseInt(durationMatch[1]);
          const unit = durationMatch[2].toLowerCase();
          if (unit.startsWith('hour') || unit === 'hr') {
            endDate = new Date(startDate.getTime() + amount * 60 * 60 * 1000);
          } else {
            endDate = new Date(startDate.getTime() + amount * 60 * 1000);
          }
        }

        // Clean up title
        const title = details
          .replace(/\b(tomorrow|today|next week|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|for\s+\d+\s*(?:hours?|hrs?|minutes?|mins?))\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim() || 'New Event';

        const result = await createCalendarEvent({
          title,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        });
        
        if (result.success) {
          addAssistantMessage(`✅ **Calendar event created!**

📅 **${title}**
🕐 ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

The event has been added to your calendar.

Would you like me to:
• Add attendees or a location
• Create a related task
• Schedule another event?`);
        } else {
          addAssistantMessage(`❌ Couldn't create calendar event: ${result.error}

Make sure you have Google Calendar or Outlook connected in **[Integrations](/integrations)**.`);
        }
        break;
      }

      case 'view_tasks': {
        addAssistantMessage(`📋 Fetching your tasks...`);
        const taskList = await fetchTasks();
        const formatted = formatTasksForChat(taskList);
        addAssistantMessage(formatted);
        break;
      }

      case 'view_projects': {
        addAssistantMessage(`📁 Fetching your projects...`);
        const projectList = await fetchProjects();
        const formatted = formatProjectsForChat(projectList);
        addAssistantMessage(formatted);
        break;
      }
    }
  }, [createTask, createProject, createCalendarEvent, fetchTasks, fetchProjects, formatTasksForChat, formatProjectsForChat, addAssistantMessage]);
  useEffect(() => {
    if (voiceError) {
      toast({
        variant: "destructive",
        title: "Voice Input Error",
        description: voiceError,
      });
    }
  }, [voiceError, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Check if this is an email navigation request
  const isEmailNavigationRequest = useCallback((text: string): { isNav: boolean; action?: string } => {
    const lower = text.toLowerCase();
    
    if (lower.includes('show email') || lower.includes('review email') || lower.includes('go through email') ||
        (lower.includes('show') && lower.includes('one by one')) || lower === 'show emails') {
      return { isNav: true, action: 'start' };
    }
    if (lower === 'next' || lower === 'next email' || lower.includes('show next') || lower === 'continue') {
      return { isNav: true, action: 'next' };
    }
    if (lower === 'back' || lower === 'previous' || lower === 'prev' || lower.includes('previous email')) {
      return { isNav: true, action: 'prev' };
    }
    if (lower.includes('back to summary') || lower.includes('show summary') || lower === 'summary') {
      return { isNav: true, action: 'summary' };
    }
    if (lower.includes('skip to urgent') || lower.includes('urgent only')) {
      return { isNav: true, action: 'urgent' };
    }
    
    return { isNav: false };
  }, []);

  // Handle email navigation
  const handleEmailNavigation = useCallback(async (action: string) => {
    if (!currentAnalysis) {
      addAssistantMessage(`📭 I don't have any emails loaded yet. Let me check your inbox first...`);
      await handleInboxRequest();
      return;
    }

    const allEmails = getAllEmailsInOrder();
    if (allEmails.length === 0) {
      addAssistantMessage(`📭 Your inbox is clear! No emails to review.`);
      return;
    }

    switch (action) {
      case 'start':
        setCurrentEmailIndex(0);
        setIsViewingEmails(true);
        const firstEmail = allEmails[0];
        addAssistantMessage(formatSingleEmailForChat(firstEmail, 1, allEmails.length));
        break;
        
      case 'next':
        if (!isViewingEmails) {
          setCurrentEmailIndex(0);
          setIsViewingEmails(true);
          addAssistantMessage(formatSingleEmailForChat(allEmails[0], 1, allEmails.length));
        } else if (currentEmailIndex < allEmails.length - 1) {
          const nextIndex = currentEmailIndex + 1;
          setCurrentEmailIndex(nextIndex);
          addAssistantMessage(formatSingleEmailForChat(allEmails[nextIndex], nextIndex + 1, allEmails.length));
        } else {
          addAssistantMessage(`✅ **That's all the emails!**

You've reviewed all ${allEmails.length} emails.

**Quick recap:**
• 🔴 ${currentAnalysis.urgent.length} urgent
• 🟡 ${currentAnalysis.needsResponse.length} need response
• 🟢 ${currentAnalysis.fyi.length} FYI only

Say **"back to summary"** to see the overview, or ask me to draft a reply to any email by number.`);
          setIsViewingEmails(false);
        }
        break;
        
      case 'prev':
        if (currentEmailIndex > 0) {
          const prevIndex = currentEmailIndex - 1;
          setCurrentEmailIndex(prevIndex);
          addAssistantMessage(formatSingleEmailForChat(allEmails[prevIndex], prevIndex + 1, allEmails.length));
        } else {
          addAssistantMessage(`📧 This is the first email. Say **"next"** to continue or **"back to summary"** to see the overview.`);
        }
        break;
        
      case 'summary':
        setIsViewingEmails(false);
        setCurrentEmailIndex(0);
        addAssistantMessage(formatAnalysisForChat(currentAnalysis));
        break;
        
      case 'urgent':
        if (currentAnalysis.urgent.length === 0) {
          addAssistantMessage(`✅ **No urgent emails!** Your inbox is in good shape.

Say **"show emails"** to review all emails, or **"next"** to continue.`);
        } else {
          setCurrentEmailIndex(0);
          setIsViewingEmails(true);
          addAssistantMessage(formatSingleEmailForChat(currentAnalysis.urgent[0], 1, currentAnalysis.urgent.length));
        }
        break;
    }
  }, [currentAnalysis, currentEmailIndex, isViewingEmails, getAllEmailsInOrder, formatSingleEmailForChat, formatAnalysisForChat, addAssistantMessage, handleInboxRequest]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isInboxLoading || isCalendarLoading || isDrafting || isSendingEmail || isFinancialLoading || isTaskLoading) return;
    stopListening();
    const message = input.trim();
    setInput("");

    // Check for email navigation
    const emailNavCheck = isEmailNavigationRequest(message);
    if (emailNavCheck.isNav && emailNavCheck.action) {
      await sendMessage(message, true);
      await handleEmailNavigation(emailNavCheck.action);
      textareaRef.current?.focus();
      return;
    }

    // Check if this is a send request
    if (isSendRequest(message)) {
      await sendMessage(message, true);
      await handleSendRequest();
      textareaRef.current?.focus();
      return;
    }

    // Check if this is a draft request - also handle "draft reply" when viewing an email
    const draftCheck = isDraftRequest(message);
    if (draftCheck.isDraft) {
      await sendMessage(message, true);
      // If viewing emails and no specific number given, use current email
      const emailNum = draftCheck.emailNum || (isViewingEmails ? currentEmailIndex + 1 : undefined);
      await handleDraftRequest(emailNum, draftCheck.keyword, draftCheck.tone);
      textareaRef.current?.focus();
      return;
    }

    // Check for "create task" or "create project" when viewing an email - use email subject
    const taskActionCheck = isTaskActionRequest(message);
    if (taskActionCheck.isAction && taskActionCheck.action) {
      await sendMessage(message, true);
      
      // If viewing an email and creating task/project without details, use email info
      if (isViewingEmails && (taskActionCheck.action === 'create_task' || taskActionCheck.action === 'create_project')) {
        const allEmails = getAllEmailsInOrder();
        const currentEmail = allEmails[currentEmailIndex];
        if (currentEmail && !taskActionCheck.details) {
          taskActionCheck.details = `Follow up: ${currentEmail.subject}`;
        }
      }
      
      await handleTaskActionRequest(taskActionCheck.action, taskActionCheck.details);
      textareaRef.current?.focus();
      return;
    }

    // Check if this is a calendar view request
    if (isCalendarRequest(message)) {
      await sendMessage(message, true);
      await handleCalendarRequest();
      textareaRef.current?.focus();
      return;
    }

    // Check if this is a financial request
    if (isFinancialRequest(message)) {
      await sendMessage(message, true);
      await handleFinancialRequest();
      textareaRef.current?.focus();
      return;
    }

    // Check if this is an inbox request
    if (isInboxRequest(message)) {
      await sendMessage(message, true);
      await handleInboxRequest();
    } else {
      await sendMessage(message);
    }
    
    textareaRef.current?.focus();
  };

  const handleQuickAction = async (prompt: string, isInbox?: boolean, isFinancial?: boolean, isCalendar?: boolean) => {
    stopListening();
    
    if (isCalendar) {
      await sendMessage(prompt, true);
      await handleCalendarRequest();
    } else if (isFinancial) {
      await sendMessage(prompt, true);
      await handleFinancialRequest();
    } else if (isInbox) {
      await sendMessage(prompt, true);
      await handleInboxRequest();
    } else {
      await sendMessage(prompt);
    }
  };

  const handleVoiceToggle = () => {
    if (!isVoiceSupported) {
      toast({
        variant: "destructive",
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice input. Try Chrome or Edge.",
      });
      return;
    }
    toggleListening();
  };

  return (
    <AccessGate>
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 flex flex-col h-screen pt-14 lg:pt-0">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-border bg-card/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12">
                    <VOPSyMascot size="sm" animate={true} className="!w-10 !h-10 sm:!w-12 sm:!h-12" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-success rounded-full border-2 border-card animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
                    VOPSy
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">AI Assistant</Badge>
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Your Virtual Operations Intelligence</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="p-4 sm:p-6">
                <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        layout
                        className={cn(
                          "flex gap-2 sm:gap-3",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "vopsy" && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 mt-1">
                            <VOPSyMascot size="sm" animate={false} className="!w-8 !h-8 sm:!w-10 sm:!h-10" />
                          </div>
                        )}
                        
                        <div
                          className={cn(
                            "max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {message.role === "vopsy" && !message.isStreaming && (
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <span className="text-[10px] sm:text-xs font-semibold text-primary">VOPSy</span>
                            </div>
                          )}
                          
                          {message.isStreaming ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-primary" />
                              <span className="text-xs sm:text-sm text-muted-foreground">VOPSy is thinking...</span>
                            </div>
                          ) : (
                            <div className="text-xs sm:text-sm leading-relaxed">
                              {formatMessage(message.content)}
                            </div>
                          )}
                          
                          {!message.isStreaming && (
                            <p className={cn(
                              "text-[9px] sm:text-[10px] mt-2 sm:mt-3",
                              message.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                            )}>
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                        
                        {message.role === "user" && (
                          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-1">
                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-card/30 shrink-0">
              <div className="max-w-3xl mx-auto">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {quickActions.slice(0, 6).map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-[10px] sm:text-xs gap-1 sm:gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 px-2 sm:px-3 py-1 h-auto",
                        (action.isInbox || action.isFinancial || action.isCalendar) && "border-primary/30 bg-primary/5"
                      )}
                      onClick={() => handleQuickAction(action.prompt, action.isInbox, action.isFinancial, action.isCalendar)}
                      disabled={isLoading || isInboxLoading || isFinancialLoading || isCalendarLoading}
                    >
                      {(action.isInbox && isInboxLoading) || (action.isFinancial && isFinancialLoading) || (action.isCalendar && isCalendarLoading) ? (
                        <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                      ) : (
                        <action.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      )}
                      <span className="hidden sm:inline">{action.label}</span>
                      <span className="sm:hidden">{action.label.split(' ')[0]}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 border-t border-border bg-card shrink-0">
              <div className="max-w-3xl mx-auto">
                {/* Voice listening indicator */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <div className="relative">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-pulse" />
                          </div>
                          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-primary">Listening...</p>
                          {interimTranscript && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground italic truncate">"{interimTranscript}"</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopListening}
                          className="text-primary hover:text-primary hover:bg-primary/20 text-xs"
                        >
                          Stop
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      placeholder={isListening ? "Speak now..." : "Ask VOPSy anything..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className={cn(
                        "min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none bg-background pr-10 sm:pr-12 text-sm",
                        isListening && "border-primary ring-1 ring-primary"
                      )}
                      disabled={isLoading}
                    />
                    {/* Voice button inside textarea */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceToggle}
                      disabled={isLoading}
                      className={cn(
                        "absolute right-1.5 sm:right-2 top-1.5 sm:top-2 p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8",
                        isListening 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {isListening ? (
                        <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                  </div>
                  <Button 
                    size="lg" 
                    className="px-4 sm:px-6 shrink-0 h-auto"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-2 text-center">
                  {isVoiceSupported 
                    ? "💬 Type or 🎤 speak to VOPSy • Powered by AI"
                    : "VOPSy can help with finance, operations, marketing, compliance, and education • Powered by AI"
                  }
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AccessGate>
  );
}
