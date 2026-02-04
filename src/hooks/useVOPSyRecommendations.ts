import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export interface IntegrationRecommendation {
  integrationId: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  context: string;
}

/**
 * VOPSy Integration Recommendations Hook
 * 
 * Provides contextual integration recommendations based on:
 * - Current page/route
 * - User's connected integrations
 * - User's tier level
 * - User's activity patterns
 */
export function useVOPSyRecommendations(
  connectedIntegrations: string[] = []
): IntegrationRecommendation[] {
  const location = useLocation();
  const currentPath = location.pathname;

  const recommendations = useMemo(() => {
    const recs: IntegrationRecommendation[] = [];

    // Communications Page Recommendations
    if (currentPath.includes('/communications')) {
      if (!connectedIntegrations.includes('google-workspace') && !connectedIntegrations.includes('microsoft-365')) {
        recs.push({
          integrationId: 'google-workspace',
          reason: 'Connect Gmail to let VOPSy read and manage your emails',
          priority: 'high',
          context: 'You\'re on the Communications page. VOPSy can help manage your inbox if you connect Gmail.'
        });
      }
      
      if (!connectedIntegrations.includes('mailchimp')) {
        recs.push({
          integrationId: 'mailchimp',
          reason: 'Send email campaigns and newsletters automatically',
          priority: 'medium',
          context: 'Want to send bulk emails? Connect Mailchimp and VOPSy can create campaigns for you.'
        });
      }

      if (!connectedIntegrations.includes('slack')) {
        recs.push({
          integrationId: 'slack',
          reason: 'Get notifications and respond to team messages',
          priority: 'low',
          context: 'Connect Slack to centralize all your team communications.'
        });
      }
    }

    // Financial Hub Recommendations
    if (currentPath.includes('/financial') || currentPath.includes('/finance')) {
      if (!connectedIntegrations.includes('quickbooks')) {
        recs.push({
          integrationId: 'quickbooks',
          reason: 'Automate expense tracking and financial reporting',
          priority: 'high',
          context: 'You\'re viewing financial data. Connect QuickBooks so VOPSy can analyze your P&L and cash flow.'
        });
      }

      if (!connectedIntegrations.includes('stripe')) {
        recs.push({
          integrationId: 'stripe',
          reason: 'Track payments and revenue automatically',
          priority: 'high',
          context: 'Connect Stripe to see all your payment data in one place.'
        });
      }

      if (!connectedIntegrations.includes('gusto')) {
        recs.push({
          integrationId: 'gusto',
          reason: 'Automate payroll and HR tasks',
          priority: 'medium',
          context: 'Connect Gusto to streamline payroll processing.'
        });
      }
    }

    // Academy/Courses Page Recommendations
    if (currentPath.includes('/academy') || currentPath.includes('/courses')) {
      if (!connectedIntegrations.includes('shopify') && !connectedIntegrations.includes('woocommerce')) {
        recs.push({
          integrationId: 'shopify',
          reason: 'Sell your courses online with automated order processing',
          priority: 'medium',
          context: 'Want to monetize your courses? Connect Shopify to set up an online store.'
        });
      }

      if (!connectedIntegrations.includes('mailchimp')) {
        recs.push({
          integrationId: 'mailchimp',
          reason: 'Send course updates and marketing emails to students',
          priority: 'medium',
          context: 'Connect Mailchimp to email your students about new courses.'
        });
      }
    }

    // VOPSy Page Recommendations
    if (currentPath.includes('/vopsy')) {
      if (!connectedIntegrations.includes('zapier')) {
        recs.push({
          integrationId: 'zapier',
          reason: 'Connect to 6,000+ apps and let VOPSy trigger automations',
          priority: 'high',
          context: 'Zapier unlocks VOPSy\'s full potential - connect any tool you use.'
        });
      }

      if (!connectedIntegrations.includes('google-workspace')) {
        recs.push({
          integrationId: 'google-workspace',
          reason: 'Let VOPSy access your Gmail, Calendar, and Drive',
          priority: 'high',
          context: 'VOPSy needs access to your tools to help you. Start with Google Workspace.'
        });
      }
    }

    // Hub/Dashboard Recommendations
    if (currentPath === '/hub' || currentPath === '/') {
      if (!connectedIntegrations.includes('zapier')) {
        recs.push({
          integrationId: 'zapier',
          reason: 'Universal connector to 6,000+ apps',
          priority: 'high',
          context: 'Start with Zapier to connect all your business tools in one place.'
        });
      }

      if (!connectedIntegrations.includes('google-workspace')) {
        recs.push({
          integrationId: 'google-workspace',
          reason: 'Connect your email, calendar, and files',
          priority: 'high',
          context: 'Google Workspace is the foundation - connect it first.'
        });
      }

      if (!connectedIntegrations.includes('quickbooks')) {
        recs.push({
          integrationId: 'quickbooks',
          reason: 'See your financial health at a glance',
          priority: 'medium',
          context: 'Connect QuickBooks to track your business finances automatically.'
        });
      }
    }

    // Integrations Page - Always recommend Zapier if not connected
    if (currentPath.includes('/integrations')) {
      if (!connectedIntegrations.includes('zapier')) {
        recs.push({
          integrationId: 'zapier',
          reason: 'Connect to 6,000+ apps with one integration',
          priority: 'high',
          context: 'Zapier is your universal connector - it unlocks access to thousands of tools.'
        });
      }
    }

    // Sort by priority
    return recs.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [currentPath, connectedIntegrations]);

  return recommendations;
}
