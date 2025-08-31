-- Fix the security definer view warning by creating a regular view instead

-- Drop the view that was flagged as security definer
DROP VIEW IF EXISTS public.security_audit_summary;

-- Create a regular view (not security definer) for security audit summary
CREATE VIEW public.security_audit_summary AS
SELECT 
  'invites'::text as table_name,
  'Users can only see invites they created or received'::text as protection_level,
  'email_privacy'::text as protection_type
UNION ALL
SELECT 
  'payment_transactions'::text as table_name,
  'Owner-only access with audit logging'::text as protection_level,
  'financial_data'::text as protection_type
UNION ALL
SELECT 
  'webhooks'::text as table_name,
  'Metadata access only, secrets via secure function'::text as protection_level,
  'webhook_security'::text as protection_type
UNION ALL
SELECT 
  'user_ai_providers'::text as table_name,
  'Owner access with monitoring and rate limiting'::text as protection_level,
  'api_key_security'::text as protection_type;