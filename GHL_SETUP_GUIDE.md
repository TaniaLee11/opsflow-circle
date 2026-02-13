# GoHighLevel Pipeline Integration Setup Guide

## Overview
This guide will help you complete the GoHighLevel Private Integration setup to enable pipeline synchronization with Virtual OPS Hub.

## Current Status
✅ Navigation menu updated and deployed
✅ Pipeline page created with GHL integration
✅ Edge function created for pipeline sync
✅ Private Integration form filled (awaiting completion)
⏳ API key needs to be added to Supabase secrets

## Step 1: Complete Private Integration Creation

### What's Already Done:
- Integration name: "Virtual OPS Hub Pipeline"
- Description: "Integration for Virtual OPS Hub platform to sync pipeline opportunities, contacts, and deal stages"
- Scopes selected:
  - ✅ contacts.readonly
  - ✅ contacts.write
  - ✅ opportunities.readonly
  - ✅ opportunities.write
  - ✅ workflows.readonly

### What You Need to Do:
1. Go to [GoHighLevel Private Integrations](https://app.gohighlevel.com/v2/location/xVT2gzHtEAYCuwmWgAbG/settings/private-integrations)
2. Click the blue "Create" button to finalize the integration
3. **IMPORTANT**: Copy the API key immediately - you can only see it once!
4. Save the API key somewhere secure temporarily

## Step 2: Add API Key to Supabase

### Method 1: Via Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/vault)
2. Navigate to: Settings → Vault → Secrets
3. Click "New Secret"
4. Add the following secrets:
   - **Name**: `GHL_API_KEY`
   - **Value**: [Paste the API key from GoHighLevel]
5. Click "Add Secret"

### Method 2: Via Supabase CLI
```bash
# Set the GHL API key
supabase secrets set GHL_API_KEY="your-api-key-here"

# Optionally set location ID if different
supabase secrets set GHL_LOCATION_ID="xVT2gzHtEAYCuwmWgAbG"
```

## Step 3: Deploy Edge Function

The edge function is already created at:
`supabase/functions/ghl-sync-pipeline/index.ts`

Deploy it with:
```bash
cd /home/ubuntu/opsflow-circle
supabase functions deploy ghl-sync-pipeline
```

## Step 4: Test the Integration

1. Navigate to the Pipeline page in Virtual OPS Hub
2. The page should automatically detect the API key and sync data
3. You should see:
   - Active deals count
   - Pipeline value
   - Contact count
   - List of opportunities

## Troubleshooting

### Issue: "Setup Required" message still showing
**Solution**: 
- Verify the API key is correctly set in Supabase secrets
- Check the secret name is exactly `GHL_API_KEY` (case-sensitive)
- Redeploy the edge function after adding secrets

### Issue: "Connection Error" or API errors
**Solution**:
- Verify the API key is valid and not expired
- Check that all 5 scopes are enabled in the Private Integration
- Ensure the location ID matches your GHL account

### Issue: No opportunities showing
**Solution**:
- Verify you have opportunities in your GoHighLevel pipeline
- Check the GHL location ID is correct
- Click "Sync Now" to manually trigger a sync

## API Endpoints

### Sync Pipeline Data
```
POST /functions/v1/ghl-sync-pipeline
```

This endpoint:
- Fetches all opportunities from GoHighLevel
- Fetches associated contact data
- Caches data in Supabase for performance
- Returns formatted data for the Pipeline page

## Security Notes

1. **Never commit API keys to Git** - They are stored in Supabase secrets
2. **Rotate tokens every 90 days** - As recommended by GoHighLevel
3. **Use minimal scopes** - We only use 5 essential scopes for pipeline management
4. **Monitor access logs** - Check Supabase logs for any suspicious activity

## Next Steps After Setup

Once the integration is working:
1. ✅ Pipeline data will sync automatically
2. 🔄 Manual sync available via "Sync Now" button
3. 🤖 VOPSy can access pipeline data for AI automation
4. 📊 Dashboard will show real-time pipeline metrics

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Review Supabase function logs
3. Verify all setup steps were completed
4. Contact support with specific error messages

---

**Last Updated**: February 13, 2026
**Integration Version**: 1.0
**API Version**: 2021-07-28
