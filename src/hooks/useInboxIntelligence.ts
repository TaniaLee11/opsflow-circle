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
}

export type DraftTone = 'professional' | 'friendly' | 'brief' | 'detailed';

export function useInboxIntelligence() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState<InboxStatus | null>(null);
  const [analysis, setAnalysis] = useState<InboxAnalysis | null>(null);
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

      return data.draft as EmailDraft;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Draft failed';
      toast.error(errorMsg);
      return null;
    }
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

  // Format analysis for chat display
  const formatAnalysisForChat = useCallback((analysisData: InboxAnalysis): string => {
    const lines: string[] = [];
    
    lines.push(`📧 **Inbox Intelligence Report**`);
    lines.push(`Connected to: **${analysisData.connectedAccount}** (${analysisData.provider})`);
    lines.push(`Last sync: ${new Date(analysisData.analyzedAt).toLocaleTimeString()}`);
    lines.push('');
    lines.push(analysisData.summary);
    lines.push('');

    if (analysisData.urgent.length > 0) {
      lines.push('---');
      lines.push('🔴 **URGENT — Needs Immediate Attention**');
      analysisData.urgent.forEach((email, i) => {
        lines.push(`**${i + 1}.** "${email.subject}" (from ${email.from})`);
        lines.push(`   ${email.summary}`);
        if (email.suggestedAction) {
          lines.push(`   → *${email.suggestedAction}*`);
        }
      });
      lines.push('');
    }

    if (analysisData.needsResponse.length > 0) {
      lines.push('---');
      lines.push('🟡 **NEEDS RESPONSE — Requests & Approvals**');
      analysisData.needsResponse.forEach((email, i) => {
        const num = analysisData.urgent.length + i + 1;
        lines.push(`**${num}.** "${email.subject}" (from ${email.from})`);
        lines.push(`   ${email.summary}`);
        if (email.suggestedAction) {
          lines.push(`   → *${email.suggestedAction}*`);
        }
      });
      lines.push('');
    }

    if (analysisData.fyi.length > 0) {
      lines.push('---');
      lines.push('🟢 **FYI — No Action Needed**');
      const startNum = analysisData.urgent.length + analysisData.needsResponse.length + 1;
      analysisData.fyi.slice(0, 5).forEach((email, i) => {
        lines.push(`**${startNum + i}.** "${email.subject}" — ${email.summary}`);
      });
      if (analysisData.fyi.length > 5) {
        lines.push(`   ...and ${analysisData.fyi.length - 5} more`);
      }
    }

    lines.push('');
    lines.push('---');
    lines.push('💬 **Want me to draft a reply?** Just say "draft reply to #1" or "reply to the invoice email"');

    return lines.join('\n');
  }, []);

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
    status,
    analysis,
    error,
    checkConnection,
    analyzeInbox,
    draftReply,
    formatAnalysisForChat,
    formatDraftForChat,
    getEmailByNumber,
    findEmailByKeyword,
  };
}
