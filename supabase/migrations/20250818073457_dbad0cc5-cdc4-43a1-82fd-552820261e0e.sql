-- Fix security issues identified in the security scan
-- Use IF EXISTS to avoid conflicts

-- 1. Fix invites table RLS policy to prevent email harvesting
-- The current policy allows viewing by email which exposes email addresses
-- We need to remove the email-based access and only allow access by creator

DROP POLICY IF EXISTS "Users can view invites sent to them" ON public.invites;

-- Only allow viewing invites they created (this policy may already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invites' 
    AND policyname = 'Users can view invites they created'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view invites they created" ON public.invites FOR SELECT USING (created_by = auth.uid())';
  END IF;
END $$;

-- 2. Fix marketplace agents table to restrict access
-- Remove overly permissive policy that allows all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view marketplace agents" ON public.marketplace_agents_secure;

-- 3. Fix detailed_analytics table overlapping policies
-- Remove all conflicting policies and create a single clear one
DROP POLICY IF EXISTS "Users can view relevant analytics" ON public.detailed_analytics;
DROP POLICY IF EXISTS "Agent owners can view their analytics" ON public.detailed_analytics;
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.detailed_analytics;

-- Create single consolidated analytics policy
CREATE POLICY "Analytics access control" ON public.detailed_analytics
FOR SELECT USING (
  (auth.uid() = user_id) 
  OR 
  (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = detailed_analytics.agent_id 
    AND agents.user_id = auth.uid()
  ))
);

-- 4. Add secure invite validation function
CREATE OR REPLACE FUNCTION public.validate_invite_code_secure(p_invite_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.invites
    WHERE invite_code = upper(p_invite_code)
    AND used_at IS NULL
    AND expires_at > now()
  );
END;
$$;