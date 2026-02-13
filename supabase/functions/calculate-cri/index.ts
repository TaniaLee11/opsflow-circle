// Component 2: Calculate CRI (Compliance Risk Index)
// Edge Function to calculate user's compliance health score
// Created: February 13, 2026

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CRIFactorScore {
  score: number
  weight: number
  data_source: string
  details?: string
}

interface CRIBreakdown {
  cash_flow_volatility: CRIFactorScore
  tax_reserve_adequacy: CRIFactorScore
  missed_deadlines: CRIFactorScore
  payroll_liabilities: CRIFactorScore
  entity_alignment: CRIFactorScore
  grant_compliance: CRIFactorScore | null
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const userId = user.id

    // Get user's compliance profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_compliance_profile')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User compliance profile not found. Please complete your profile in Settings.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize CRI breakdown
    const breakdown: CRIBreakdown = {
      cash_flow_volatility: { score: 50, weight: 0.20, data_source: 'none', details: 'No financial data connected' },
      tax_reserve_adequacy: { score: 50, weight: 0.25, data_source: 'none', details: 'No financial data connected' },
      missed_deadlines: { score: 100, weight: 0.20, data_source: 'platform', details: 'No missed deadlines' },
      payroll_liabilities: { score: 100, weight: 0.15, data_source: 'none', details: 'No payroll data' },
      entity_alignment: { score: 75, weight: 0.10, data_source: 'profile', details: 'Entity type configured' },
      grant_compliance: profile.is_nonprofit && profile.grant_funded 
        ? { score: 75, weight: 0.10, data_source: 'none', details: 'No grant tracking data' }
        : null
    }

    // Factor 1: Cash Flow Volatility (from QuickBooks if connected)
    // TODO: Integrate with QuickBooks API when available
    // For now, use placeholder logic
    breakdown.cash_flow_volatility = {
      score: 85,
      weight: 0.20,
      data_source: 'estimated',
      details: 'Connect QuickBooks for accurate cash flow analysis'
    }

    // Factor 2: Tax Reserve Adequacy (from QuickBooks if connected)
    // TODO: Integrate with QuickBooks API when available
    breakdown.tax_reserve_adequacy = {
      score: 60,
      weight: 0.25,
      data_source: 'estimated',
      details: 'Connect QuickBooks to track tax reserves'
    }

    // Factor 3: Missed Deadlines (from compliance_events)
    const { data: events, error: eventsError } = await supabaseClient
      .from('compliance_events')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['overdue', 'upcoming'])

    if (!eventsError && events) {
      const overdueCount = events.filter(e => e.status === 'overdue').length
      const upcomingCount = events.filter(e => e.status === 'upcoming').length
      
      // Score calculation: 100 - (overdueCount * 15) - (upcomingCount * 5)
      const deadlineScore = Math.max(0, 100 - (overdueCount * 15) - (upcomingCount * 5))
      
      breakdown.missed_deadlines = {
        score: deadlineScore,
        weight: 0.20,
        data_source: 'platform',
        details: `${overdueCount} overdue, ${upcomingCount} upcoming deadlines`
      }
    }

    // Factor 4: Payroll Liabilities (from payroll system if connected)
    if (profile.has_employees) {
      // TODO: Integrate with payroll system
      breakdown.payroll_liabilities = {
        score: 85,
        weight: 0.15,
        data_source: 'estimated',
        details: 'Connect payroll system for accurate tracking'
      }
    } else {
      breakdown.payroll_liabilities = {
        score: 100,
        weight: 0.15,
        data_source: 'profile',
        details: 'No employees'
      }
    }

    // Factor 5: Entity Structure Alignment
    const entityAlignmentScore = calculateEntityAlignment(profile)
    breakdown.entity_alignment = {
      score: entityAlignmentScore.score,
      weight: 0.10,
      data_source: 'profile',
      details: entityAlignmentScore.details
    }

    // Factor 6: Grant Compliance (nonprofits only)
    if (profile.is_nonprofit && profile.grant_funded) {
      breakdown.grant_compliance = {
        score: 75,
        weight: 0.10,
        data_source: 'estimated',
        details: 'Set up grant tracking for accurate compliance monitoring'
      }
    }

    // Calculate weighted CRI score
    let totalScore = 0
    let totalWeight = 0

    Object.values(breakdown).forEach(factor => {
      if (factor !== null) {
        totalScore += factor.score * factor.weight
        totalWeight += factor.weight
      }
    })

    const finalScore = Math.round(totalScore / totalWeight)

    // Determine risk level
    let riskLevel: string
    if (finalScore >= 80) riskLevel = 'healthy'
    else if (finalScore >= 60) riskLevel = 'attention'
    else if (finalScore >= 40) riskLevel = 'warning'
    else riskLevel = 'critical'

    // Generate alerts
    const alerts: string[] = []
    if (finalScore < 60) alerts.push('CRI score below 60 - consider advisory review')
    if (finalScore < 40) alerts.push('CRITICAL: CRI score below 40 - human review required')
    if (breakdown.missed_deadlines.score < 70) alerts.push('Multiple compliance deadlines need attention')
    if (breakdown.tax_reserve_adequacy.score < 50) alerts.push('Tax reserve adequacy is low')

    // Save CRI score
    const { error: upsertError } = await supabaseClient
      .from('cri_scores')
      .upsert({
        user_id: userId,
        score: finalScore,
        score_breakdown: breakdown,
        risk_level: riskLevel,
        alerts_triggered: alerts,
        calculated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (upsertError) {
      console.error('Error saving CRI score:', upsertError)
      throw upsertError
    }

    // If score is critical, create a financial alert
    if (finalScore < 40) {
      await supabaseClient
        .from('financial_alerts')
        .insert({
          user_id: userId,
          alert_type: 'cri_critical',
          severity: 'critical',
          title: 'Critical Compliance Risk Detected',
          message: `Your Compliance Risk Index is ${finalScore}/100. Immediate human advisory review is recommended.`,
          action_required: true,
          action_url: '/settings/advisory'
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        cri_score: finalScore,
        risk_level: riskLevel,
        breakdown,
        alerts,
        message: `CRI score calculated: ${finalScore}/100 (${riskLevel})`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error calculating CRI:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

// Helper function to calculate entity alignment score
function calculateEntityAlignment(profile: any): { score: number; details: string } {
  // Basic scoring logic - can be enhanced
  let score = 50 // Base score
  let details = ''

  // Has entity type configured
  if (profile.entity_type) {
    score += 25
    details = `Entity type: ${profile.entity_type}`
  }

  // State configured
  if (profile.state) {
    score += 15
    details += `, State: ${profile.state}`
  }

  // Industry configured
  if (profile.industry) {
    score += 10
    details += `, Industry: ${profile.industry}`
  }

  return { score: Math.min(100, score), details }
}
