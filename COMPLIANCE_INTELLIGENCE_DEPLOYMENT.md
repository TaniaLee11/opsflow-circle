# Compliance Intelligence System - Deployment Guide

## Overview

This document provides instructions for deploying the 7 Innovation Components that transform Virtual OPS Hub into a compliance intelligence platform.

## Components Implemented

### Phase 1: Foundation
1. **Component 7: Compliance Ontology** - Standardized data model for small organization compliance
2. **Component 1: Compliance Intelligence Engine** - Core rules and user profile system
3. **Component 2: CRI Score** - Compliance Risk Index (0-100 scoring system)

### Phase 2: Governance
4. **Component 3: Escalation Protocol** - Human-AI boundary definitions
5. **Component 5: Trust Framework** - Transparent reasoning and trust metrics

### Phase 3: Scale
6. **Component 6: ML Optimization Loop** - Learning from human corrections
7. **Component 4: Enterprise Intelligence Layer** - Portfolio-level intelligence

## Database Migrations

### Migration Files Created

All migrations are in `/supabase/migrations/`:

1. `20260213_component_7_compliance_ontology.sql` - Core ontology tables
2. `20260213_seed_entity_ontology.sql` - Entity type definitions (LLC, S-Corp, 501c3, etc.)
3. `20260213_seed_regulatory_obligations_federal.sql` - Federal compliance obligations
4. `20260213_seed_regulatory_obligations_ny.sql` - NY state obligations
5. `20260213_seed_compliance_sequences.sql` - Compliance event sequences
6. `20260213_component_1_compliance_intelligence.sql` - Intelligence engine tables
7. `20260213_seed_compliance_rules.sql` - Compliance rules and thresholds
8. `20260213_component_2_cri_score.sql` - CRI scoring system
9. `20260213_component_3_escalation_protocol.sql` - Escalation rules
10. `20260213_seed_escalation_rules.sql` - Escalation rule definitions
11. `20260213_component_5_trust_framework.sql` - Trust and reasoning tracking
12. `20260213_component_6_ml_optimization.sql` - ML learning system
13. `20260213_component_4_enterprise_intelligence.sql` - Enterprise layer

### Deployment Steps

#### Option 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/rugazxkuyjgondgojkmo/sql/new
2. Copy and paste each migration file in order (listed above)
3. Click "Run" for each migration
4. Verify no errors in the Results tab

#### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref rugazxkuyjgondgojkmo

# Run migrations
supabase db push
```

## Edge Functions

### Functions Created

1. **calculate-cri** - Calculates user's Compliance Risk Index
   - Location: `/supabase/functions/calculate-cri/index.ts`
   - Calculates 6 weighted factors
   - Triggers alerts for critical scores

2. **vopsy-chat** (Enhanced) - AI chat with compliance intelligence
   - Location: `/supabase/functions/vopsy-chat/index.ts`
   - New module: `/supabase/functions/vopsy-chat/compliance-context.ts`
   - Provides compliance-aware responses

### Deployment Steps

#### Option 1: Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/rugazxkuyjgondgojkmo/functions
2. Click "Deploy new function"
3. For `calculate-cri`:
   - Name: `calculate-cri`
   - Copy content from `/supabase/functions/calculate-cri/index.ts`
   - Deploy
4. For `vopsy-chat`:
   - Update existing function
   - Copy content from `/supabase/functions/vopsy-chat/index.ts`
   - Include `compliance-context.ts` module
   - Deploy

#### Option 2: Supabase CLI

```bash
# Deploy calculate-cri function
supabase functions deploy calculate-cri

# Deploy vopsy-chat function
supabase functions deploy vopsy-chat
```

## Frontend Integration

### Files Modified

1. **Sidebar.tsx** - Navigation menu reorganized
2. **Pipeline.tsx** - GHL integration prepared

### Automatic Deployment

- Changes are automatically deployed via Vercel when pushed to GitHub
- Current deployment: https://opsflow-circle.vercel.app

## Testing & Verification

### 1. Database Verification

Run this query in SQL Editor to verify tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%compliance%' 
OR table_name LIKE '%cri%' 
OR table_name LIKE '%escalation%'
OR table_name LIKE '%trust%'
OR table_name LIKE '%enterprise%'
ORDER BY table_name;
```

Expected tables:
- entity_ontology
- regulatory_obligations
- compliance_sequences
- compliance_rules
- user_compliance_profile
- compliance_events
- cri_scores
- cri_history
- escalation_rules
- escalation_log
- vopsy_reasoning_log
- trust_metrics
- advisory_corrections
- ml_performance
- enterprise_organizations
- osi_scores
- enterprise_alerts

### 2. Edge Function Verification

Test calculate-cri function:

```bash
curl -X POST 'https://rugazxkuyjgondgojkmo.supabase.co/functions/v1/calculate-cri' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### 3. Frontend Verification

1. Visit https://opsflow-circle.vercel.app/dashboard
2. Verify new navigation structure:
   - Dashboard
   - VOPSy
   - Academy
   - **Operations:**
     - Communication
     - Productivity
     - Finance Hub
     - Pipeline
     - Automations
     - Studio
     - Vault

## Data Population

### Initial Setup for Testing

1. Create a test user compliance profile:

```sql
INSERT INTO user_compliance_profile (
  user_id, entity_type, state, industry, has_employees, is_nonprofit
) VALUES (
  'YOUR_USER_ID', 'llc', 'NY', 'consulting', false, false
);
```

2. Calculate initial CRI score:
   - Call the `calculate-cri` edge function
   - Or wait for automatic calculation on first VOPSy chat

3. Test VOPSy with compliance questions:
   - "What tax deadlines do I have coming up?"
   - "Do I need to file quarterly estimated taxes?"
   - "What's my Compliance Risk Index?"

## Monitoring

### Key Metrics to Track

1. **CRI Scores** - Monitor user compliance health
2. **Escalation Events** - Track when human intervention is required
3. **Trust Metrics** - Measure AI recommendation acceptance rates
4. **ML Performance** - Track correction rates over time

### Dashboard Queries

View all users with critical CRI scores:

```sql
SELECT 
  p.email,
  c.score,
  c.risk_level,
  c.alerts_triggered
FROM cri_scores c
JOIN profiles p ON p.id = c.user_id
WHERE c.risk_level = 'critical'
ORDER BY c.score ASC;
```

View recent escalations:

```sql
SELECT 
  p.email,
  er.trigger_type,
  er.escalation_message,
  el.created_at
FROM escalation_log el
JOIN profiles p ON p.id = el.user_id
JOIN escalation_rules er ON er.id = el.rule_id
WHERE el.resolved = false
ORDER BY el.created_at DESC
LIMIT 20;
```

## Troubleshooting

### Common Issues

1. **Migration fails with "relation already exists"**
   - Some tables may already exist
   - Use `CREATE TABLE IF NOT EXISTS` (already in migrations)
   - Safe to re-run

2. **Edge function deployment fails**
   - Check Supabase service role key is set
   - Verify ANTHROPIC_API_KEY is configured in Supabase secrets (Claude API)

3. **CRI calculation returns errors**
   - Ensure user has a compliance profile
   - Check that entity_ontology table is populated

## Next Steps

1. **Deploy GHL Integration**
   - Complete the private integration in GoHighLevel
   - Add GHL_API_KEY to Supabase secrets
   - Deploy ghl-sync-pipeline edge function

2. **Enable Automatic CRI Calculation**
   - Set up scheduled function to calculate CRI nightly
   - Configure alerts for critical scores

3. **Train Advisory Team**
   - Review escalation protocols
   - Set up correction workflow for ML optimization

## Support

For issues or questions:
- GitHub: https://github.com/TaniaLee11/opsflow-circle
- Email: tanya@virtualopsassist.com

---

**Deployment Date:** February 13, 2026
**Version:** 1.0.0
**Status:** Ready for Production
