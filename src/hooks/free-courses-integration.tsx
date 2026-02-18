import { useState } from 'react';
import { submitFreeCourseSignup } from '@/lib/ghl-api';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for Free Courses page integration with GHL
 * Handles email capture and contact creation when user clicks CTAs
 */
export function useFreeCoursesIntegration() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Show email capture modal when user clicks CTA
   * @param redirectUrl - Optional URL to redirect to after email capture
   */
  const captureEmail = (redirectUrl?: string) => {
    setPendingRedirect(redirectUrl || null);
    setIsModalOpen(true);
  };

  /**
   * Submit email to GHL with free-signup tag
   * This triggers WF-A3: Free Account Onboarding workflow in n8n
   */
  const submitEmail = async (email: string, firstName?: string) => {
    setIsSubmitting(true);

    try {
      const result = await submitFreeCourseSignup(email, firstName);

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit');
      }

      toast({
        title: "Welcome!",
        description: "Check your email for your free course access and onboarding guide.",
      });

      setIsModalOpen(false);

      // Redirect if URL was provided
      if (pendingRedirect) {
        setTimeout(() => {
          window.location.href = pendingRedirect;
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
      setPendingRedirect(null);
    },
  };
}
