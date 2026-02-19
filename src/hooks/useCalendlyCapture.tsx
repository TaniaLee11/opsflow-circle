import { useState } from 'react';
import { createGHLContact } from '../lib/ghl-api';

export const useCalendlyCapture = (calendlyUrl: string, source: string) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScheduleCall = () => {
    // Show email capture modal first
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (email: string, firstName?: string, lastName?: string) => {
    setIsSubmitting(true);
    
    try {
      // Create contact in GHL with calendly-intent tag
      await createGHLContact({
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        tags: ['calendly-intent', source],
      });

      // Close modal
      setShowEmailModal(false);
      
      // Open Calendly in new tab
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Error capturing lead:', error);
      // Still open Calendly even if GHL fails
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
      setShowEmailModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showEmailModal,
    setShowEmailModal,
    handleScheduleCall,
    handleEmailSubmit,
    isSubmitting,
  };
};
