-- Enable RLS on security_audit_summary view and fix remaining security issues

-- Views can't have RLS directly, but the view shows static data so it's safe
-- However, let's make sure the invites table RLS policy is working correctly

-- Check current policies on invites table and ensure they're comprehensive
DROP POLICY IF EXISTS "users_can_view_own_invites_secure" ON public.invites;

CREATE POLICY "invites_secure_access" 
ON public.invites 
FOR SELECT 
USING (
  (created_by = auth.uid()) OR 
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Ensure the security_audit_summary view is properly defined without SECURITY DEFINER
DROP VIEW IF EXISTS public.security_audit_summary CASCADE;

CREATE VIEW public.security_audit_summary AS
SELECT 
  'invites'::text as table_name,
  'Users can only see invites they created or received'::text as protection_level,
  'email_privacy'::text as protection_type,
  'HIGH'::text as security_level
UNION ALL
SELECT 
  'payment_transactions'::text,
  'Owner-only access with audit logging'::text,
  'financial_data'::text,
  'HIGH'::text
UNION ALL
SELECT 
  'webhooks'::text,
  'Metadata access only, secrets via secure function'::text,
  'webhook_security'::text,
  'HIGH'::text
UNION ALL
SELECT 
  'user_ai_providers'::text,
  'Owner access with monitoring and rate limiting'::text,
  'api_key_security'::text,
  'HIGH'::text;