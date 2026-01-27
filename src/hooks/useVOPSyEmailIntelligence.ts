import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useInboxIntelligence, AnalyzedEmail, InboxAnalysis, EmailDraft } from './useInboxIntelligence';

export type EmailAction = 
  | { type: 'scan_inbox' }
  | { type: 'show_emails' }
  | { type: 'next_email' }
  | { type: 'prev_email' }
  | { type: 'draft_reply'; emailIndex?: number; tone?: string; instructions?: string }
  | { type: 'send_draft' }
  | { type: 'refine_draft'; instructions: string }
  | { type: 'skip_to_urgent' }
  | { type: 'back_to_summary' };

export interface EmailContext {
  hasAnalysis: boolean;
  analysis: InboxAnalysis | null;
  currentEmailIndex: number;
  currentEmail: AnalyzedEmail | null;
  currentDraft: EmailDraft | null;
  totalEmails: number;
  isProcessing: boolean;
}

export function useVOPSyEmailIntelligence() {
  const inbox = useInboxIntelligence();
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastDraftEmailRef = useRef<AnalyzedEmail | null>(null);

  // Get all emails in priority order
  const allEmails = inbox.getAllEmailsInOrder();
  const totalEmails = allEmails.length;
  const currentEmail = allEmails[currentEmailIndex] || null;

  // Get the current email context for VOPSy
  const getEmailContext = useCallback((): EmailContext => {
    return {
      hasAnalysis: !!inbox.analysis,
      analysis: inbox.analysis,
      currentEmailIndex: currentEmailIndex + 1, // 1-indexed for display
      currentEmail,
      currentDraft: inbox.currentDraft,
      totalEmails,
      isProcessing: isProcessing || inbox.isLoading || inbox.isAnalyzing,
    };
  }, [inbox.analysis, currentEmailIndex, currentEmail, inbox.currentDraft, totalEmails, isProcessing, inbox.isLoading, inbox.isAnalyzing]);

  // Parse user message for email-related intents
  const parseEmailIntent = useCallback((message: string): EmailAction | null => {
    const lower = message.toLowerCase().trim();
    
    // Scan/check inbox
    if (lower.includes('scan') && (lower.includes('inbox') || lower.includes('email')) ||
        lower.includes('check') && (lower.includes('inbox') || lower.includes('email')) ||
        lower.includes('inbox intelligence') ||
        lower === 'scan inbox' ||
        lower === 'check email' ||
        lower === 'check my email') {
      return { type: 'scan_inbox' };
    }

    // Show emails list
    if (lower.includes('show email') || lower === 'show emails' || lower === 'list emails') {
      return { type: 'show_emails' };
    }

    // Navigation
    if (lower === 'next' || lower === 'next email') {
      return { type: 'next_email' };
    }
    if (lower === 'back' || lower === 'previous' || lower === 'prev') {
      return { type: 'prev_email' };
    }
    if (lower.includes('skip to urgent') || lower.includes('urgent only')) {
      return { type: 'skip_to_urgent' };
    }
    if (lower.includes('back to summary') || lower.includes('show summary')) {
      return { type: 'back_to_summary' };
    }

    // Draft reply
    if (lower.includes('draft reply') || lower.includes('draft a reply') || lower.includes('write reply')) {
      // Check for specific email number
      const numMatch = lower.match(/(?:to\s+)?(?:#|number\s+)?(\d+)/);
      const emailIndex = numMatch ? parseInt(numMatch[1], 10) - 1 : undefined;
      
      // Check for tone
      let tone: string | undefined;
      if (lower.includes('friendly')) tone = 'friendly';
      else if (lower.includes('brief') || lower.includes('short')) tone = 'brief';
      else if (lower.includes('detailed')) tone = 'detailed';
      else tone = 'professional';
      
      return { type: 'draft_reply', emailIndex, tone };
    }

    // Send draft
    if (lower === 'send it' || lower === 'send' || lower === 'send draft' || lower === 'send the email') {
      return { type: 'send_draft' };
    }

    // Refine draft
    if (inbox.currentDraft && (
      lower.includes('make it') || 
      lower.includes('add ') || 
      lower.includes('change ') ||
      lower.includes('shorter') ||
      lower.includes('longer') ||
      lower.includes('more friendly') ||
      lower.includes('more professional')
    )) {
      return { type: 'refine_draft', instructions: message };
    }

    return null;
  }, [inbox.currentDraft]);

  // Execute email action and return response
  const executeEmailAction = useCallback(async (action: EmailAction): Promise<string | null> => {
    setIsProcessing(true);

    try {
      switch (action.type) {
        case 'scan_inbox': {
          const result = await inbox.analyzeInbox();
          if (!result) {
            const status = inbox.status;
            if (!status?.connected) {
              return "📭 **No email connected**\n\nTo use inbox intelligence, please connect your Google Workspace or Microsoft 365 account in **Settings → Integrations**.\n\nOnce connected, I can:\n• Scan and prioritize your emails\n• Draft contextual replies\n• Help you process your inbox efficiently";
            }
            return "I couldn't analyze your inbox right now. Please try again.";
          }
          setCurrentEmailIndex(0);
          return inbox.formatAnalysisForChat(result);
        }

        case 'show_emails': {
          if (!inbox.analysis || totalEmails === 0) {
            return "📭 No emails to show. Say **\"scan inbox\"** first to check your email.";
          }
          setCurrentEmailIndex(0);
          return inbox.formatSingleEmailForChat(allEmails[0], 1, totalEmails);
        }

        case 'next_email': {
          if (!inbox.analysis || totalEmails === 0) {
            return "📭 No emails loaded. Say **\"scan inbox\"** first.";
          }
          const nextIndex = Math.min(currentEmailIndex + 1, totalEmails - 1);
          setCurrentEmailIndex(nextIndex);
          return inbox.formatSingleEmailForChat(allEmails[nextIndex], nextIndex + 1, totalEmails);
        }

        case 'prev_email': {
          if (!inbox.analysis || totalEmails === 0) {
            return "📭 No emails loaded. Say **\"scan inbox\"** first.";
          }
          const prevIndex = Math.max(currentEmailIndex - 1, 0);
          setCurrentEmailIndex(prevIndex);
          return inbox.formatSingleEmailForChat(allEmails[prevIndex], prevIndex + 1, totalEmails);
        }

        case 'skip_to_urgent': {
          if (!inbox.analysis) {
            return "📭 No emails loaded. Say **\"scan inbox\"** first.";
          }
          const urgentEmails = inbox.analysis.urgent;
          if (urgentEmails.length === 0) {
            return "✅ **No urgent emails!** Your inbox is in good shape.\n\nSay **\"show emails\"** to review all emails, or **\"back to summary\"** for the overview.";
          }
          // Find first urgent email in the full list
          const firstUrgent = allEmails.findIndex(e => e.priority === 'urgent');
          if (firstUrgent >= 0) {
            setCurrentEmailIndex(firstUrgent);
            return inbox.formatSingleEmailForChat(allEmails[firstUrgent], firstUrgent + 1, totalEmails);
          }
          return "No urgent emails found.";
        }

        case 'back_to_summary': {
          if (!inbox.analysis) {
            return "📭 No analysis available. Say **\"scan inbox\"** to check your email.";
          }
          return inbox.formatAnalysisForChat(inbox.analysis);
        }

        case 'draft_reply': {
          const emailToReply = action.emailIndex !== undefined 
            ? allEmails[action.emailIndex] 
            : currentEmail;
          
          if (!emailToReply) {
            return "❌ No email selected to reply to.\n\nSay **\"scan inbox\"** first, then **\"show emails\"** to select one.";
          }

          lastDraftEmailRef.current = emailToReply;
          const draft = await inbox.draftReply(
            emailToReply,
            (action.tone as 'professional' | 'friendly' | 'brief' | 'detailed') || 'professional',
            action.instructions
          );

          if (!draft) {
            return "❌ Couldn't generate a draft. Please try again.";
          }

          return inbox.formatDraftForChat(draft, emailToReply.subject);
        }

        case 'send_draft': {
          if (!inbox.currentDraft) {
            return "❌ No draft to send. Say **\"draft reply\"** first to create one.";
          }
          const result = await inbox.sendDraft();
          if (result.success) {
            return `✅ **Email sent!**\n\nYour reply has been sent successfully.\n\n${totalEmails > currentEmailIndex + 1 ? 'Say **\"next\"** to continue processing emails.' : 'You\'ve reached the end of your email queue!'}`;
          }
          return `❌ **Send failed:** ${result.error}\n\nPlease try again or check your email connection in Settings.`;
        }

        case 'refine_draft': {
          if (!inbox.currentDraft || !lastDraftEmailRef.current) {
            return "❌ No draft to refine. Say **\"draft reply\"** first.";
          }
          
          const refinedDraft = await inbox.draftReply(
            lastDraftEmailRef.current,
            'professional',
            action.instructions
          );

          if (!refinedDraft) {
            return "❌ Couldn't refine the draft. Please try again.";
          }

          return inbox.formatDraftForChat(refinedDraft, lastDraftEmailRef.current.subject);
        }

        default:
          return null;
      }
    } catch (error) {
      console.error('Email action error:', error);
      return `❌ An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
    } finally {
      setIsProcessing(false);
    }
  }, [inbox, allEmails, currentEmail, currentEmailIndex, totalEmails]);

  // Build email context string for VOPSy system prompt
  const buildEmailContextForPrompt = useCallback((): string => {
    const ctx = getEmailContext();
    
    if (!ctx.hasAnalysis) {
      return `The user has not scanned their inbox yet. If they ask about email, suggest they say "scan inbox" to check their email.`;
    }

    const lines: string[] = [];
    lines.push(`EMAIL CONTEXT:`);
    lines.push(`- Connected to: ${ctx.analysis?.connectedAccount} (${ctx.analysis?.provider})`);
    lines.push(`- Total emails: ${ctx.totalEmails}`);
    lines.push(`- Urgent: ${ctx.analysis?.urgent.length || 0}`);
    lines.push(`- Needs response: ${ctx.analysis?.needsResponse.length || 0}`);
    lines.push(`- FYI: ${ctx.analysis?.fyi.length || 0}`);
    
    if (ctx.currentEmail) {
      lines.push(`\nCURRENT EMAIL (#${ctx.currentEmailIndex} of ${ctx.totalEmails}):`);
      lines.push(`- Subject: ${ctx.currentEmail.subject}`);
      lines.push(`- From: ${ctx.currentEmail.from}`);
      lines.push(`- Priority: ${ctx.currentEmail.priority}`);
      lines.push(`- Summary: ${ctx.currentEmail.summary}`);
    }

    if (ctx.currentDraft) {
      lines.push(`\nDRAFT IN PROGRESS:`);
      lines.push(`- Subject: ${ctx.currentDraft.subject}`);
      lines.push(`- The user can say "send it" to send, or request changes.`);
    }

    return lines.join('\n');
  }, [getEmailContext]);

  return {
    ...inbox,
    currentEmailIndex,
    setCurrentEmailIndex,
    currentEmail,
    totalEmails,
    allEmails,
    isProcessing,
    getEmailContext,
    parseEmailIntent,
    executeEmailAction,
    buildEmailContextForPrompt,
  };
}
