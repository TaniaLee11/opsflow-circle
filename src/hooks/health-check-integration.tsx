import { useState } from 'react';
import { submitHealthCheckQuiz } from '@/lib/ghl-api';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for Business Health Check quiz integration with GHL
 * Handles email capture and contact creation when quiz is completed
 */
export function useHealthCheckIntegration() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  /**
   * Show email capture modal when quiz is completed
   * Call this BEFORE showing quiz results
   */
  const captureEmail = () => {
    setIsModalOpen(true);
  };

  /**
   * Submit email to GHL with quiz-complete tag
   * This triggers WF-A2: Quiz Complete Nudge workflow in n8n
   */
  const submitEmail = async (email: string, firstName?: string) => {
    setIsSubmitting(true);

    try {
      const result = await submitHealthCheckQuiz(email, firstName);

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit');
      }

      toast({
        title: "Success!",
        description: "Check your email for your personalized business health report.",
      });

      setIsModalOpen(false);
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
    closeModal: () => setIsModalOpen(false),
  };
}
