-- Fix security issue with agent_analytics table RLS policies
-- Remove the broken admin policy and make user policies more restrictive

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.agent_analytics;
DROP POLICY IF EXISTS "Users can view analytics for public agents" ON public.agent_analytics;

-- Create restrictive policy: Users can only view their own analytics
CREATE POLICY "Users can view their own analytics only" 
ON public.agent_analytics 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Deny all access to unauthenticated users
CREATE POLICY "Deny all access to unauthenticated users" 
ON public.agent_analytics 
FOR ALL 
TO anon
USING (false);

-- Make analytics immutable for security (no updates/deletes)
CREATE POLICY "Deny all updates to analytics" 
ON public.agent_analytics 
FOR UPDATE 
TO authenticated
USING (false);

CREATE POLICY "Deny all deletes to analytics" 
ON public.agent_analytics 
FOR DELETE 
TO authenticated
USING (false);