# Manual Deployment Steps for GoHighLevel Integration

## ✅ Completed Steps

1. **Navigation Menu Updated**
   - ✅ Reorganized left sidebar navigation
   - ✅ Changed "Communications" to "Communication"
   - ✅ Reordered items: Communication, Productivity, Finance Hub, Pipeline, Automations, Studio, Vault
   - ✅ Deployed to Vercel (auto-deployed via GitHub push)

2. **Pipeline Page Created**
   - ✅ Full UI with GHL integration
   - ✅ Setup instructions for users
   - ✅ Stats dashboard (Active Deals, Pipeline Value, Contacts)
   - ✅ Opportunities list view
   - ✅ Sync functionality

3. **Edge Function Created**
   - ✅ File: `supabase/functions/ghl-sync-pipeline/index.ts`
   - ✅ Handles GHL API authentication
   - ✅ Fetches opportunities and contacts
   - ✅ Graceful handling when API key not configured
   - ✅ Pushed to GitHub repository

## ⏳ Remaining Steps

### Step 1: Deploy Edge Function to Supabase

**Option A: Via Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/qmrxuqjnfvqjqmkqcbvj/functions)
2. Navigate to: Edge Functions
3. Click "Deploy new function"
4. Select the `ghl-sync-pipeline` folder
5. Click "Deploy"

**Option B: Via Supabase CLI (when connectivity restored)**
```bash
# Login to Supabase
supabase login

# Link project
supabase link --project-ref qmrxuqjnfvqjqmkqcbvj

# Deploy function
supabase functions deploy ghl-sync-pipeline
```

### Step 2: Complete GoHighLevel Private Integration

1. Go to [GHL Private Integrations](https://app.gohighlevel.com/v2/location/xVT2gzHtEAYCuwmWgAbG/settings/private-integrations)
2. The integration form is already filled with:
   - Name: "Virtual OPS Hub Pipeline"
   - Description: "Integration for Virtual OPS Hub platform..."
   - Scopes: contacts.readonly, contacts.write, opportunities.readonly, opportunities.write, workflows.readonly
3. **Click the blue "Create" button**
4. **Copy the API key immediately** (you can only see it once!)

### Step 3: Add API Key to Supabase Secrets

**Via Supabase Dashboard:**
1. Go to [Supabase Vault](https://supabase.com/dashboard/project/qmrxuqjnfvqjqmkqcbvj/settings/vault)
2. Navigate to: Settings → Vault → Secrets
3. Click "New Secret"
4. Add:
   - Name: `GHL_API_KEY`
   - Value: [Your API key from Step 2]
5. Click "Add Secret"

**Via Supabase CLI:**
```bash
supabase secrets set GHL_API_KEY="your-api-key-here" --project-ref qmrxuqjnfvqjqmkqcbvj
```

### Step 4: Create Database Table (if not exists)

Run this SQL in Supabase SQL Editor:

```sql
-- Create table for caching GHL pipeline data
CREATE TABLE IF NOT EXISTS ghl_pipeline_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL,
  opportunities JSONB DEFAULT '[]'::jsonb,
  contacts JSONB DEFAULT '[]'::jsonb,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ghl_pipeline_sync_location 
ON ghl_pipeline_sync(location_id);

-- Enable RLS
ALTER TABLE ghl_pipeline_sync ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to read pipeline data"
ON ghl_pipeline_sync FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow service role to manage pipeline data"
ON ghl_pipeline_sync FOR ALL
TO service_role
USING (true);
```

### Step 5: Test the Integration

1. Navigate to https://opsflow-circle.vercel.app/pipeline
2. You should see:
   - If API key not set: Setup instructions
   - If API key set: Pipeline dashboard with real data
3. Click "Sync Now" to manually trigger sync
4. Verify data appears correctly

## Verification Checklist

- [ ] Navigation menu shows new order on live site
- [ ] Pipeline page loads without errors
- [ ] Edge function deployed to Supabase
- [ ] GHL Private Integration created
- [ ] API key added to Supabase secrets
- [ ] Database table created
- [ ] Pipeline data syncs successfully
- [ ] Opportunities display correctly
- [ ] Contact data shows properly

## Rollback Plan

If issues occur:
1. Remove API key from Supabase secrets
2. The Pipeline page will show setup instructions
3. Previous git commit: `c364066`
4. Rollback command: `git revert 6d47b4b`

## Support Files

- Setup Guide: `GHL_SETUP_GUIDE.md`
- Edge Function: `supabase/functions/ghl-sync-pipeline/index.ts`
- Pipeline Page: `src/pages/Pipeline.tsx`
- Migration: `supabase/migrations/20260212_gohighlevel_pipeline.sql`

---

**Deployment Date**: February 13, 2026
**Git Commit**: 6d47b4b
**Status**: Awaiting edge function deployment and API key configuration
