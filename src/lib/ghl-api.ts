/**
 * GoHighLevel API Integration
 * Handles contact creation and tag assignment for landing page conversions
 * Uses serverless function to keep API keys secure
 */

const GHL_API_ENDPOINT = '/api/ghl-create-contact';

export interface GHLContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

export interface GHLResponse {
  success: boolean;
  contactId?: string;
  error?: string;
}

/**
 * Create or update a contact in GoHighLevel
 * @param contactData - Contact information including email and tags
 * @returns Promise with success status and contact ID
 */
export async function createGHLContact(contactData: GHLContactData): Promise<GHLResponse> {
  try {
    const response = await fetch(GHL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: contactData.email,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        phone: contactData.phone,
        tags: contactData.tags,
        customFields: contactData.customFields,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `GHL API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      contactId: data.contact?.id || data.id,
    };
  } catch (error) {
    console.error('GHL API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Landing page tag mappings
 * Each landing page triggers a specific n8n workflow via GHL tags
 */
export const LANDING_PAGE_TAGS = {
  HEALTH_CHECK: 'quiz-complete',           // Triggers WF-A2: Quiz Complete Nudge
  FREE_COURSES: 'free-signup',             // Triggers WF-A3: Free Account Onboarding
  TAX_SEASON: 'tax-season-2026',           // Triggers custom tax season workflow
  RESET_SIGNUP: 'reset-signup',            // Triggers WF-A1: 7-Day Business Reset
} as const;

/**
 * Convenience function for health check quiz submissions
 */
export async function submitHealthCheckQuiz(email: string, firstName?: string): Promise<GHLResponse> {
  return createGHLContact({
    email,
    firstName,
    tags: [LANDING_PAGE_TAGS.HEALTH_CHECK],
  });
}

/**
 * Convenience function for free course signups
 */
export async function submitFreeCourseSignup(email: string, firstName?: string): Promise<GHLResponse> {
  return createGHLContact({
    email,
    firstName,
    tags: [LANDING_PAGE_TAGS.FREE_COURSES],
  });
}

/**
 * Convenience function for tax season signups
 */
export async function submitTaxSeasonSignup(email: string, firstName?: string): Promise<GHLResponse> {
  return createGHLContact({
    email,
    firstName,
    tags: [LANDING_PAGE_TAGS.TAX_SEASON],
  });
}
