import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  isUnread: boolean;
  labels: string[];
}

export interface AnalyzedEmail extends EmailMessage {
  priority: 'urgent' | 'needs_response' | 'fyi';
  category: string;
  summary: string;
  suggestedAction?: string;
}

export interface InboxAnalysis {
  provider: string;
  connectedAccount: string;
  analyzedAt: string;
  urgent: AnalyzedEmail[];
  needsResponse: AnalyzedEmail[];
  fyi: AnalyzedEmail[];
  summary: string;
}

export interface InboxStatus {
  connected: boolean;
  provider?: string;
  connectedAccount?: string;
  error?: string;
  message?: string;
}

export interface EmailDraft {
  subject: string;
  body: string;
  tone: string;
  originalEmailId: string;
  to?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type DraftTone = 'professional' | 'friendly' | 'brief' | 'detailed';

export function useInboxIntelligence() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<InboxStatus | null>(null);
  const [analysis, setAnalysis] = useState<InboxAnalysis | null>(null);
  const [currentDraft, setCurrentDraft] = useState<EmailDraft | null>(null);
  const [currentDraftRecipient, setCurrentDraftRecipient] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check inbox connection status
  const checkConnection = useCallback(async (): Promise<InboxStatus> => {
    setIsFetching(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('inbox-fetch', {});
      
      if (fnError) {
        throw new Error(fnError.message || 'Failed to check inbox connection');
      }

      const statusResult: InboxStatus = {
        connected: data.connected,
        provider: data.data?.provider,
        connectedAccount: data.data?.connectedAccount,
        error: data.error,
        message: data.message,
      };

      setStatus(statusResult);
      return statusResult;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection check failed';
      setError(errorMsg);
      setStatus({ connected: false, error: errorMsg });
      return { connected: false, error: errorMsg };
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Fetch and analyze inbox
  const analyzeInbox = useCallback(async (): Promise<InboxAnalysis | null> => {
    setIsLoading(true);
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // First fetch emails
      const { data: fetchData, error: fetchError } = await supabase.functions.invoke('inbox-fetch', {});
      
      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch emails');
      }

      if (!fetchData.connected) {
        setStatus({ connected: false, message: fetchData.message, error: fetchData.error });
        return null;
      }

      if (!fetchData.data?.emails || fetchData.data.emails.length === 0) {
        const emptyAnalysis: InboxAnalysis = {
          provider: fetchData.data?.provider || 'Email',
          connectedAccount: fetchData.data?.connectedAccount || '',
          analyzedAt: new Date().toISOString(),
          urgent: [],
          needsResponse: [],
          fyi: [],
          summary: '📭 **Your inbox is clear!** No unread or flagged emails from today.',
        };
        setAnalysis(emptyAnalysis);
        setStatus({ connected: true, provider: fetchData.data?.provider, connectedAccount: fetchData.data?.connectedAccount });
        return emptyAnalysis;
      }

      // Then analyze the emails
      const { data: analyzeData, error: analyzeError } = await supabase.functions.invoke('inbox-analyze', {
        body: {
          emails: fetchData.data.emails,
          provider: fetchData.data.provider,
          connectedAccount: fetchData.data.connectedAccount,
        },
      });

      if (analyzeError) {
        throw new Error(analyzeError.message || 'Failed to analyze emails');
      }

      const analysisResult = analyzeData.analysis as InboxAnalysis;
      setAnalysis(analysisResult);
      setStatus({ 
        connected: true, 
        provider: analysisResult.provider, 
        connectedAccount: analysisResult.connectedAccount 
      });
      
      return analysisResult;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  }, []);

  // Draft an email reply
  const draftReply = useCallback(async (
    email: AnalyzedEmail,
    tone: DraftTone = 'professional',
    instructions?: string,
    userName?: string
  ): Promise<EmailDraft | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('draft-email-reply', {
        body: {
          originalEmail: {
            id: email.id,
            subject: email.subject,
            from: email.from,
            snippet: email.snippet,
            summary: email.summary,
          },
          tone,
          instructions,
          userContext: userName ? { userName } : undefined,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to draft reply');
      }

      const draft = {
        ...data.draft as EmailDraft,
        to: email.from, // Store recipient from original email
      };
      
      // Store the current draft and recipient for sending later
      setCurrentDraft(draft);
      setCurrentDraftRecipient(email.from);
      
      return draft;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Draft failed';
      toast.error(errorMsg);
      return null;
    }
  }, []);

  // Send the drafted email
  const sendDraft = useCallback(async (draft?: EmailDraft): Promise<SendResult> => {
    const draftToSend = draft || currentDraft;
    const recipient = draft?.to || currentDraftRecipient;
    
    if (!draftToSend) {
      return { success: false, error: 'No draft to send. Please draft a reply first.' };
    }

    if (!recipient) {
      return { success: false, error: 'No recipient found for this draft.' };
    }

    setIsSending(true);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-email', {
        body: {
          originalEmailId: draftToSend.originalEmailId,
          subject: draftToSend.subject,
          body: draftToSend.body,
          to: recipient,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to send email');
      }

      const result = data as SendResult;
      
      if (result.success) {
        // Clear the draft after successful send
        setCurrentDraft(null);
        setCurrentDraftRecipient(null);
        toast.success('Email sent successfully!');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Send failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSending(false);
    }
  }, [currentDraft, currentDraftRecipient]);

  // Clear the current draft
  const clearDraft = useCallback(() => {
    setCurrentDraft(null);
    setCurrentDraftRecipient(null);
  }, []);

  // Format a draft for chat display
  const formatDraftForChat = useCallback((draft: EmailDraft, originalSubject: string): string => {
    const lines: string[] = [];
    
    lines.push(`✉️ **Draft Reply Ready**`);
    lines.push(`Replying to: *${originalSubject}*`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`**Subject:** ${draft.subject}`);
    lines.push('');
    lines.push(draft.body);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('📝 **What would you like to do?**');
    lines.push('• Say "**send it**" to send this reply');
    lines.push('• Say "**make it shorter**" or "**more friendly**" to adjust');
    lines.push('• Say "**add...**" to include specific points');
    lines.push('• Say "**start over**" for a fresh draft');

    return lines.join('\n');
  }, []);

  // Format analysis for chat display - overview summary
  const formatAnalysisForChat = useCallback((analysisData: InboxAnalysis): string => {
    const lines: string[] = [];
    const totalEmails = analysisData.urgent.length + analysisData.needsResponse.length + analysisData.fyi.length;
    
    lines.push(`📧 **Inbox Intelligence Report**`);
    lines.push(`Connected to: **${analysisData.connectedAccount}** (${analysisData.provider})`);
    lines.push(`Last sync: ${new Date(analysisData.analyzedAt).toLocaleTimeString()}`);
    lines.push('');
    lines.push(analysisData.summary);
    lines.push('');
    lines.push('---');
    lines.push(`📬 **${totalEmails} emails found:**`);
    lines.push(`• 🔴 ${analysisData.urgent.length} urgent`);
    lines.push(`• 🟡 ${analysisData.needsResponse.length} need response`);
    lines.push(`• 🟢 ${analysisData.fyi.length} FYI only`);
    lines.push('');
    lines.push('---');
    lines.push('💬 **Say "show emails" to review them one by one with action options**');
    lines.push('Or say "draft reply to #1" to jump directly to a specific email');

    return lines.join('\n');
  }, []);

  // Format a single email for detailed view with actions
  const formatSingleEmailForChat = useCallback((email: AnalyzedEmail, index: number, total: number): string => {
    const lines: string[] = [];
    
    const priorityIcon = email.priority === 'urgent' ? '🔴' : email.priority === 'needs_response' ? '🟡' : '🟢';
    const priorityLabel = email.priority === 'urgent' ? 'URGENT' : email.priority === 'needs_response' ? 'NEEDS RESPONSE' : 'FYI';
    
    lines.push(`📧 **Email ${index} of ${total}** ${priorityIcon} ${priorityLabel}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`**Subject:** ${email.subject}`);
    lines.push(`**From:** ${email.from}`);
    lines.push(`**Received:** ${new Date(email.date).toLocaleString()}`);
    lines.push('');
    lines.push(`**Summary:** ${email.summary}`);
    lines.push('');
    if (email.suggestedAction) {
      lines.push(`💡 **Suggested action:** ${email.suggestedAction}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
    lines.push('**📋 What would you like to do?**');
    lines.push('');
    lines.push(`• **"Draft reply"** — I'll write a response for you`);
    lines.push(`• **"Create task"** — Add a follow-up task to your list`);
    lines.push(`• **"Create project"** — Start a new project from this email`);
    lines.push(`• **"Archive"** — Mark as read and archive (coming soon)`);
    lines.push(`• **"Next"** — Show the next email`);
    lines.push(`• **"Skip to urgent"** — Jump to urgent emails only`);
    lines.push('');
    if (index < total) {
      lines.push(`📬 Say **"next"** to see email ${index + 1} of ${total}`);
    } else {
      lines.push(`✅ This is the last email. Say **"back to summary"** to see the overview.`);
    }

    return lines.join('\n');
  }, []);

  // Get all emails in priority order
  const getAllEmailsInOrder = useCallback((): AnalyzedEmail[] => {
    if (!analysis) return [];
    return [
      ...analysis.urgent,
      ...analysis.needsResponse,
      ...analysis.fyi,
    ];
  }, [analysis]);

  // Get email by number from analysis
  const getEmailByNumber = useCallback((num: number): AnalyzedEmail | null => {
    if (!analysis) return null;
    
    const allEmails = [
      ...analysis.urgent,
      ...analysis.needsResponse,
      ...analysis.fyi,
    ];
    
    if (num < 1 || num > allEmails.length) return null;
    return allEmails[num - 1];
  }, [analysis]);

  // Find email by subject keyword
  const findEmailByKeyword = useCallback((keyword: string): AnalyzedEmail | null => {
    if (!analysis) return null;
    
    const allEmails = [
      ...analysis.urgent,
      ...analysis.needsResponse,
      ...analysis.fyi,
    ];
    
    const lower = keyword.toLowerCase();
    return allEmails.find(e => 
      e.subject.toLowerCase().includes(lower) || 
      e.summary.toLowerCase().includes(lower) ||
      e.from.toLowerCase().includes(lower)
    ) || null;
  }, [analysis]);

  return {
    isLoading,
    isFetching,
    isAnalyzing,
    isSending,
    status,
    analysis,
    currentDraft,
    error,
    checkConnection,
    analyzeInbox,
    draftReply,
    sendDraft,
    clearDraft,
    formatAnalysisForChat,
    formatSingleEmailForChat,
    formatDraftForChat,
    getEmailByNumber,
    findEmailByKeyword,
    getAllEmailsInOrder,
  };
}
