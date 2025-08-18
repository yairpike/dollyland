-- Fix security issues identified in the security scan

-- 1. Fix invites table RLS policy to prevent email harvesting
-- Remove the policy that allows viewing invites by email
DROP POLICY IF EXISTS "Users can view invites sent to them" ON public.invites;

-- Create a more secure policy that only allows users to view invites they created
CREATE POLICY "Users can view invites they created" ON public.invites
FOR SELECT USING (created_by = auth.uid());

-- 2. Fix marketplace agents table to restrict access
-- Remove overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view marketplace agents" ON public.marketplace_agents_secure;

-- Keep only the featured agents policy for public access
-- This ensures only featured agents are visible to all users

-- 3. Fix detailed_analytics table overlapping policies
-- Remove conflicting policies
DROP POLICY IF EXISTS "Users can view relevant analytics" ON public.detailed_analytics;
DROP POLICY IF EXISTS "Agent owners can view their analytics" ON public.detailed_analytics;

-- Create a single, clear policy for analytics access
CREATE POLICY "Analytics access control" ON public.detailed_analytics
FOR SELECT USING (
  -- Users can view analytics where they are the user_id
  (auth.uid() = user_id) 
  OR 
  -- OR where they own the agent
  (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = detailed_analytics.agent_id 
    AND agents.user_id = auth.uid()
  ))
);

-- 4. Add a secure function to validate invite codes without exposing emails
CREATE OR REPLACE FUNCTION public.validate_invite_code_secure(p_invite_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if invite code exists and is valid without exposing email
  RETURN EXISTS (
    SELECT 1 FROM public.invites
    WHERE invite_code = upper(p_invite_code)
    AND used_at IS NULL
    AND expires_at > now()
  );
END;
$$;