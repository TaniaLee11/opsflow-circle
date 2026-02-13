// Compliance Intelligence Context for VOPSy
// Provides compliance interpretation logic
// Created: February 13, 2026

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface ComplianceContext {
  userProfile: any
  applicableRules: any[]
  upcomingEvents: any[]
  criScore: any
  entityOntology: any
  regulatoryObligations: any[]
}

export async function getComplianceContext(
  supabase: SupabaseClient,
  userId: string
): Promise<ComplianceContext> {
  // Get user compliance profile
  const { data: userProfile } = await supabase
    .from('user_compliance_profile')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Get entity ontology for user's entity type
  const { data: entityOntology } = await supabase
    .from('entity_ontology')
    .select('*')
    .eq('entity_type', userProfile?.entity_type || 'llc')
    .single()

  // Get applicable compliance rules
  const { data: applicableRules } = await supabase
    .from('compliance_rules')
    .select('*')
    .contains('entity_types', [userProfile?.entity_type || 'llc'])
    .or(`jurisdiction.eq.federal,jurisdiction.eq.state:${userProfile?.state || 'NY'}`)

  // Get upcoming compliance events
  const { data: upcomingEvents } = await supabase
    .from('compliance_events')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['upcoming', 'overdue'])
    .order('due_date', { ascending: true })
    .limit(10)

  // Get CRI score
  const { data: criScore } = await supabase
    .from('cri_scores')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Get regulatory obligations for user's entity type
  const { data: regulatoryObligations } = await supabase
    .from('regulatory_obligations')
    .select('*')
    .contains('entity_types', [userProfile?.entity_type || 'llc'])
    .or(`jurisdiction.eq.federal,jurisdiction.eq.state:${userProfile?.state || 'NY'}`)
    .limit(20)

  return {
    userProfile: userProfile || null,
    applicableRules: applicableRules || [],
    upcomingEvents: upcomingEvents || [],
    criScore: criScore || null,
    entityOntology: entityOntology || null,
    regulatoryObligations: regulatoryObligations || []
  }
}

export function buildComplianceSystemPrompt(context: ComplianceContext, userTier: string): string {
  const { userProfile, criScore, entityOntology } = context

  let prompt = `
VOPSy is the AI orchestration engine inside Virtual OPS Hub, an Organizational Operating System.

COMPLIANCE INTELLIGENCE MODE ACTIVATED

User Profile:
- Entity Type: ${userProfile?.entity_type || 'Not configured'}
- State: ${userProfile?.state || 'Not configured'}
- Industry: ${userProfile?.industry || 'Not configured'}
- Has Employees: ${userProfile?.has_employees ? 'Yes' : 'No'}
- Is Nonprofit: ${userProfile?.is_nonprofit ? 'Yes' : 'No'}

`

  if (criScore) {
    prompt += `
Current Compliance Risk Index (CRI): ${criScore.score}/100 (${criScore.risk_level})
Risk Level: ${criScore.risk_level.toUpperCase()}
`
    if (criScore.alerts_triggered && criScore.alerts_triggered.length > 0) {
      prompt += `Active Alerts: ${criScore.alerts_triggered.join('; ')}\n`
    }
  }

  prompt += `
User Tier: ${userTier}

COMPLIANCE INTERPRETATION RULES:

When a user asks about compliance, taxes, deadlines, or financial obligations:

1. CHECK USER PROFILE: Reference their entity type, state, and industry from the profile above
2. CROSS-REFERENCE RULES: Match against applicable compliance_rules for their specific situation
3. CHECK EVENTS: Review upcoming deadlines or violations from compliance_events
4. EXPLAIN REASONING: Always explain WHY this rule applies to them specifically
5. CITE SOURCES: Reference the specific regulation, IRS code, or state statute
6. ESCALATE WHEN NEEDED: If severity is 'critical' or 'escalation', direct to human advisory

RESPONSE FORMAT:

Always structure compliance responses as:

**What:** [The specific requirement or obligation]

**Why:** Based on your [entity type] in [state], [rule] applies because [specific reason]

**When:** [Deadline or timing]

**Consequence:** [What happens if not complied with]

**Your Options:** [What user can do at their current tier]

TIER-BASED BOUNDARIES:

- Free Tier: Educate only. Explain concepts, point to resources. No personalized advice.
- AI Assistant ($39.99): Provide direction based on their data. User executes actions.
- AI Operations ($99.99): Can execute tasks autonomously with user oversight.
- AI Advisory ($150/hr): Human-led professional guidance. Escalate complex issues here.

CRITICAL RULES:

- NEVER give specific tax advice - always say "consult with a licensed professional"
- NEVER execute actions that exceed the user's tier authority
- ALWAYS explain your reasoning with data sources
- ALWAYS check CRI score - if below 40, recommend human advisory immediately
- NEVER use banned words: solopreneur, founder, gig worker, freelancer, side hustle, startup, small business owner, entrepreneur, bootstrapper, indie hacker

ENTITY-SPECIFIC KNOWLEDGE:

${entityOntology ? `
For ${entityOntology.display_name}:
- Tax Classification: ${entityOntology.tax_classification}
- Filing Requirements: ${JSON.stringify(entityOntology.filing_requirements)}
- Compliance Categories: ${entityOntology.compliance_categories?.join(', ')}
` : 'Entity ontology not loaded'}

Remember: You are infrastructure, not just a chatbot. Your role is to interpret compliance requirements in the context of this specific user's organizational structure and operations.
`

  return prompt
}

export function formatComplianceResponse(
  question: string,
  context: ComplianceContext,
  aiResponse: string
): string {
  // Add compliance context footer to AI responses
  let formattedResponse = aiResponse

  if (context.criScore && context.criScore.score < 60) {
    formattedResponse += `\n\n⚠️ **Note:** Your Compliance Risk Index is ${context.criScore.score}/100 (${context.criScore.risk_level}). Consider scheduling an advisory review.`
  }

  if (context.upcomingEvents && context.upcomingEvents.length > 0) {
    const overdueCount = context.upcomingEvents.filter(e => e.status === 'overdue').length
    if (overdueCount > 0) {
      formattedResponse += `\n\n🚨 **Urgent:** You have ${overdueCount} overdue compliance deadline(s).`
    }
  }

  return formattedResponse
}
