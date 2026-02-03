#!/bin/bash
# Manual Supabase Edge Functions Deployment Script
# Run this when Edge Functions need to be deployed manually

set -e

echo "🚀 Deploying Supabase Edge Functions..."

# Check if SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN environment variable not set"
    echo ""
    echo "To get your access token:"
    echo "1. Go to https://supabase.com/dashboard/account/tokens"
    echo "2. Generate a new access token"
    echo "3. Run: export SUPABASE_ACCESS_TOKEN='your_token_here'"
    echo "4. Then run this script again"
    exit 1
fi

# Deploy all functions
supabase functions deploy --project-ref rugazxkuyjgondgojkmo

echo "✅ Edge Functions deployed successfully!"
