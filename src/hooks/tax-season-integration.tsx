import { useState } from 'react';
import { submitTaxSeasonSignup } from '@/lib/ghl-api';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for Tax Season 2026 page integration with GHL
 * Handles email capture and contact creation when user clicks CTAs
 */
export function useTaxSeasonIntegration() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Show email capture modal when user clicks CTA
   * @param actionType - Type of action (e.g., 'schedule', 'start-return', 'download-guide')
   */
  const captureEmail = (actionType?: string) => {
    setPendingAction(actionType || null);
    setIsModalOpen(true);
  };

  /**
   * Submit email to GHL with tax-season-2026 tag
   * This triggers custom tax season workflow in n8n
   */
  const submitEmail = async (email: string, firstName?: string) => {
    setIsSubmitting(true);

    try {
      const result = await submitTaxSeasonSignup(email, firstName);

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit');
      }

      toast({
        title: "Success!",
        description: "Check your email for tax season resources and next steps.",
      });

      setIsModalOpen(false);

      // Handle different action types
      if (pendingAction === 'schedule') {
        // Redirect to scheduling page
        setTimeout(() => {
          window.location.href = '/contact?service=tax-review';
        }, 500);
      } else if (pendingAction === 'start-return') {
        // Redirect to tax services
        setTimeout(() => {
          window.location.href = '/tax-services';
        }, 500);
      }

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isModalOpen,
    isSubmitting,
    captureEmail,
    submitEmail,
    closeModal: () => {
      setIsModalOpen(false);
      setPendingAction(null);
    },
  };
}
