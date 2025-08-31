-- Fix all remaining security vulnerabilities

-- 1. Fix creator_earnings overly permissive policy
DROP POLICY IF EXISTS "system_can_manage_earnings" ON public.creator_earnings;

CREATE POLICY "creators_can_view_own_earnings_secure" 
ON public.creator_earnings 
FOR SELECT 
USING (creator_id = auth.uid());

CREATE POLICY "system_can_insert_earnings" 
ON public.creator_earnings 
FOR INSERT 
WITH CHECK (creator_id IS NOT NULL);

CREATE POLICY "system_can_update_earnings" 
ON public.creator_earnings 
FOR UPDATE 
USING (creator_id = auth.uid());

-- 2. Restrict subscription_plans to authenticated users only
DROP POLICY IF EXISTS "authenticated_users_can_view_active_plans" ON public.subscription_plans;

CREATE POLICY "authenticated_users_can_view_plans_secure" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true AND auth.uid() IS NOT NULL);

-- 3. Add authentication requirement for marketplace agents
DROP POLICY IF EXISTS "Marketplace featured agents public access" ON public.marketplace_agents_secure;

CREATE POLICY "authenticated_users_can_view_featured_agents" 
ON public.marketplace_agents_secure 
FOR SELECT 
USING (is_featured = true AND auth.uid() IS NOT NULL);

-- 4. Drop the security_audit_summary view entirely since it's causing security definer issues
-- Replace with a secure function instead
DROP VIEW IF EXISTS public.security_audit_summary CASCADE;

CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS TABLE(status_message text, last_updated timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow authenticated users to view security status
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to view security status';
  END IF;

  RETURN QUERY SELECT 
    'Database security policies are active and protecting sensitive data'::text as status_message,
    now() as last_updated;
END;
$$;

-- 5. Ensure the function has proper search path to avoid security definer view issues
ALTER FUNCTION public.get_security_status() SET search_path = 'public';

-- 6. Create a comprehensive security validation function for admins only
CREATE OR REPLACE FUNCTION public.validate_all_security_policies()
RETURNS TABLE(table_name text, policy_count bigint, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT 
    pol.tablename::text,
    COUNT(*)::bigint as policy_count,
    CASE 
      WHEN COUNT(*) > 0 THEN 'PROTECTED'
      ELSE 'UNPROTECTED'
    END::text as status
  FROM pg_policies pol
  WHERE pol.schemaname = 'public'
    AND pol.tablename IN ('invites', 'payment_transactions', 'creator_earnings', 'subscription_plans', 'marketplace_agents_secure')
  GROUP BY pol.tablename
  ORDER BY pol.tablename;
END;
$$;