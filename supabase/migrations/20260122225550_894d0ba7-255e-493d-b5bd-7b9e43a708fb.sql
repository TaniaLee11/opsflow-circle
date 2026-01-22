-- ================================================================
-- ABSOLUTE ENVIRONMENT ISOLATION MIGRATION
-- Ensures every user operates in a fully autonomous environment
-- Owners can only view analytics, never raw user data
-- ================================================================

-- ================================================================
-- PART 1: DROP ALL PLATFORM OWNER RAW DATA ACCESS POLICIES
-- Owners should ONLY see analytics, not raw records
-- ================================================================

-- Drop owner access to vault documents (users' private files)
DROP POLICY IF EXISTS "Owners can view all documents" ON public.vault_documents;

-- Drop owner access to studio generations (users' AI creations)
DROP POLICY IF EXISTS "Platform owners view all generations" ON public.studio_generations;

-- Drop owner access to financial documents (users' financial data)
DROP POLICY IF EXISTS "Platform owners can view all financial documents" ON public.financial_documents;

-- Drop owner access to all accounts (sensitive account data)
DROP POLICY IF EXISTS "Platform owner can read all accounts" ON public.accounts;

-- Drop owner access to all memberships (user relationships)
DROP POLICY IF EXISTS "Platform owner can read all memberships" ON public.account_memberships;

-- Drop owner access to all invitations
DROP POLICY IF EXISTS "Platform owner can read all invitations" ON public.invitations;

-- Drop owner access to course enrollments (user learning progress)
DROP POLICY IF EXISTS "Platform owners can view all enrollments" ON public.course_enrollments;

-- Drop owner access to certificates (user achievements)
DROP POLICY IF EXISTS "Platform owners can view all certificates" ON public.course_certificates;

-- Drop owner access to quiz attempts (user quiz answers)
DROP POLICY IF EXISTS "Platform owners can view all attempts" ON public.quiz_attempts;

-- ================================================================
-- PART 2: TIGHTEN ORGANIZATION-WIDE POLICIES TO USER-ONLY
-- Each user sees only their own data, not org-wide
-- ================================================================

-- Drop and recreate projects policy - user sees only their own
DROP POLICY IF EXISTS "Users can view projects in their organization" ON public.projects;
CREATE POLICY "Users can view their own projects"
ON public.projects FOR SELECT
USING (user_id = auth.uid());

-- Drop and recreate tasks policy - user sees only their own  
DROP POLICY IF EXISTS "Users can view tasks in their organization" ON public.tasks;
CREATE POLICY "Users can view their own tasks"
ON public.tasks FOR SELECT
USING (user_id = auth.uid());

-- Drop and recreate integrations policies - user sees only their own
DROP POLICY IF EXISTS "Users can view their org integrations" ON public.integrations;
DROP POLICY IF EXISTS "Users can manage their org integrations" ON public.integrations;

-- Integrations SELECT already exists: "Users can view their own integrations"
-- Integrations UPDATE already exists: "Users can update their own integrations"
-- Integrations DELETE already exists: "Users can delete their own integrations"
-- Integrations INSERT already exists: "Users can create their own integrations"

-- ================================================================
-- PART 3: TIGHTEN UPDATE/DELETE POLICIES TO USER-ONLY
-- ================================================================

-- Projects update - only own projects
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
ON public.projects FOR UPDATE
USING (user_id = auth.uid());

-- Tasks update - only own tasks
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update their own tasks"
ON public.tasks FOR UPDATE
USING (user_id = auth.uid());

-- ================================================================
-- PART 4: CREATE ANALYTICS INFRASTRUCTURE
-- Aggregated metrics only - no raw data exposure
-- ================================================================

-- Analytics events table - stores individual usage events as metrics
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid,
  event_type text NOT NULL, -- 'login', 'automation_run', 'feature_usage', 'task_completed', etc.
  event_category text NOT NULL, -- 'auth', 'automation', 'task', 'integration', 'ai', 'course'
  count integer DEFAULT 1,
  metadata jsonb DEFAULT '{}', -- NEVER store user content here, only counts/flags
  created_at timestamptz NOT NULL DEFAULT now(),
  event_date date NOT NULL DEFAULT CURRENT_DATE
);

-- Daily rollups by user (for owner analytics drill-down)
CREATE TABLE IF NOT EXISTS public.analytics_rollups_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid,
  rollup_date date NOT NULL,
  event_category text NOT NULL,
  event_type text NOT NULL,
  event_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, rollup_date, event_category, event_type)
);

-- Organization-level rollups (for enterprise admin analytics)
CREATE TABLE IF NOT EXISTS public.analytics_rollups_org (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  rollup_date date NOT NULL,
  event_category text NOT NULL,
  event_type text NOT NULL,
  event_count integer DEFAULT 0,
  unique_users integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, rollup_date, event_category, event_type)
);

-- Platform-level rollups (for platform owner analytics)
CREATE TABLE IF NOT EXISTS public.analytics_rollups_platform (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rollup_date date NOT NULL,
  event_category text NOT NULL,
  event_type text NOT NULL,
  event_count integer DEFAULT 0,
  unique_users integer DEFAULT 0,
  unique_orgs integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rollup_date, event_category, event_type)
);

-- Enable RLS on all analytics tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_rollups_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_rollups_org ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_rollups_platform ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PART 5: ANALYTICS RLS POLICIES
-- Strict isolation with analytics-only visibility for owners
-- ================================================================

-- Analytics events: Users see only their own events
CREATE POLICY "Users can view their own analytics events"
ON public.analytics_events FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analytics events"
ON public.analytics_events FOR INSERT
WITH CHECK (user_id = auth.uid());

-- User rollups: Users see own, owners see all (aggregated counts only)
CREATE POLICY "Users can view their own rollups"
ON public.analytics_rollups_user FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Platform owners can view user rollups for analytics"
ON public.analytics_rollups_user FOR SELECT
USING (is_platform_owner(auth.uid()));

-- Org rollups: Users in org see their org rollups, owners see all
CREATE POLICY "Users can view their org rollups"
ON public.analytics_rollups_org FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Platform owners can view all org rollups"
ON public.analytics_rollups_org FOR SELECT
USING (is_platform_owner(auth.uid()));

-- Platform rollups: Only platform owners
CREATE POLICY "Platform owners can view platform rollups"
ON public.analytics_rollups_platform FOR SELECT
USING (is_platform_owner(auth.uid()));

-- Service role policies for rollup generation (edge functions)
-- No INSERT policies for regular users - only service role writes rollups

-- ================================================================
-- PART 6: CREATE INDEXES FOR ANALYTICS PERFORMANCE
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_date 
ON public.analytics_events(user_id, event_date);

CREATE INDEX IF NOT EXISTS idx_analytics_events_org_date 
ON public.analytics_events(organization_id, event_date);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_date 
ON public.analytics_events(event_type, event_date);

CREATE INDEX IF NOT EXISTS idx_analytics_rollups_user_date 
ON public.analytics_rollups_user(user_id, rollup_date);

CREATE INDEX IF NOT EXISTS idx_analytics_rollups_org_date 
ON public.analytics_rollups_org(organization_id, rollup_date);

CREATE INDEX IF NOT EXISTS idx_analytics_rollups_platform_date 
ON public.analytics_rollups_platform(rollup_date);

-- ================================================================
-- PART 7: UPDATE TRIGGERS FOR ANALYTICS TABLES
-- ================================================================

CREATE TRIGGER update_analytics_rollups_user_updated_at
BEFORE UPDATE ON public.analytics_rollups_user
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_rollups_org_updated_at
BEFORE UPDATE ON public.analytics_rollups_org
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_rollups_platform_updated_at
BEFORE UPDATE ON public.analytics_rollups_platform
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- PART 8: COHORT POLICY TIGHTENING
-- Cohort owners see membership counts only, not member data
-- ================================================================

-- Drop overly permissive cohort policies
DROP POLICY IF EXISTS "Owners can view org memberships" ON public.cohort_memberships;

-- Users can only see their own cohort membership
CREATE POLICY "Users can view their own cohort membership"
ON public.cohort_memberships FOR SELECT
USING (user_id = auth.uid());