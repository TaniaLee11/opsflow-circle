# 🚨 DEPLOYMENT REQUIRED

## Status: Cohort Invite System Needs Manual Deployment

The cohort invite system code is **complete and tested**, but requires two manual deployment steps through the Supabase dashboard.

---

## ✅ What's Already Done

- ✅ Frontend updated (60-day cohort, error handling)
- ✅ Edge Functions code updated and committed
- ✅ Database migration file created
- ✅ All code pushed to GitHub
- ✅ Vercel auto-deployed frontend

---

## ❌ What Needs Manual Deployment

### 1. Database Migration (5 minutes)

**Go to:** https://supabase.com/dashboard/project/rugazxkuyjgondgojkmo/sql/new

**Run this SQL:**

```sql
-- Add organization_id to accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accounts_organization_id ON public.accounts(organization_id);

-- Verify column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'accounts' AND column_name = 'organization_id';
```

**Expected result:** Should return one row showing `organization_id | uuid`

---

### 2. Deploy Edge Functions (10 minutes)

**Option A: Via Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/rugazxkuyjgondgojkmo/functions
2. Click "Deploy function"
3. Select these functions to deploy:
   - `onboard-create-org-account`
   - `accept-invite`
   - `validate-invite`
   - `send-cohort-invite`

**Option B: Via CLI (if you have Supabase CLI)**

```bash
cd /path/to/opsflow-circle
export SUPABASE_ACCESS_TOKEN='your_token_here'
supabase functions deploy --project-ref rugazxkuyjgondgojkmo
```

To get your access token:
1. Go to: https://supabase.com/dashboard/account/tokens
2. Generate new token
3. Copy and use in command above

---

## 🧪 How to Test After Deployment

1. **Send a cohort invite** from dashboard Communications page
2. **Click the invite link** in email
3. **Complete signup** with name and password
4. **Go through onboarding** (4 steps)
5. **Verify dashboard access** - user should have full AI Operations features for 60 days

---

## 🔍 Troubleshooting

**If onboarding fails:**
- Check Supabase Edge Function logs: https://supabase.com/dashboard/project/rugazxkuyjgondgojkmo/logs/edge-functions
- Look for `onboard-create-org-account` function errors
- Verify database migration ran successfully

**If invite email doesn't send:**
- Check Google integration is connected
- Verify `send-cohort-invite` function is deployed
- Check Edge Function logs for errors

---

## 📋 Technical Details

**What the Edge Functions do:**

- `validate-invite`: Checks if invite code is valid and not expired
- `accept-invite`: Marks invite as accepted when user signs up
- `send-cohort-invite`: Sends invite email via Gmail API
- `onboard-create-org-account`: Creates org, account, and cohort membership after onboarding

**Database schema:**

```
organizations (has cohort_expires_at)
  ↓
accounts (now has organization_id FK)
  ↓
account_memberships (links users to accounts)
  ↓
cohort_memberships (grants 60-day access)
```

---

## ✅ Once Deployed

The complete cohort invite flow will work automatically:
1. Owner sends invite from dashboard
2. User receives email with invite link
3. User signs up and completes onboarding
4. System automatically creates org, account, and 60-day cohort access
5. User lands on dashboard with full AI Operations features

**No more manual setup required.**
