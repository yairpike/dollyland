-- Add RLS protection to the security audit summary view
-- Since views can't have RLS directly, convert to a secure function

DROP VIEW IF EXISTS public.security_audit_summary;

-- Create a secure function that replaces the view
CREATE OR REPLACE FUNCTION public.get_security_audit_summary()
RETURNS TABLE(table_name text, protection_level text, protection_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow authenticated users to see security audit information
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to access security audit data';
  END IF;
  
  RETURN QUERY SELECT 
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
END;
$$;