-- Fix the security definer view issue
DROP VIEW IF EXISTS public.security_audit_summary;

-- Recreate the view without SECURITY DEFINER (regular view)
CREATE VIEW public.security_audit_summary AS
SELECT 
  'invites' as table_name,
  'Users can only see invites they created or received' as protection_level,
  'email_privacy' as protection_type
UNION ALL
SELECT 
  'payment_transactions' as table_name,
  'Owner-only access with audit logging' as protection_level,
  'financial_data' as protection_type
UNION ALL
SELECT 
  'webhooks' as table_name,
  'Metadata access only, secrets via secure function' as protection_level,
  'webhook_security' as protection_type
UNION ALL
SELECT 
  'user_ai_providers' as table_name,
  'Owner access with monitoring and rate limiting' as protection_level,
  'api_key_security' as protection_type;