-- Fix the security definer view issue

-- Drop the problematic view
DROP VIEW IF EXISTS public.safe_invites_view;

-- Create a secure function instead of a security definer view
CREATE OR REPLACE FUNCTION public.get_user_invites_secure()
RETURNS TABLE(
  id uuid,
  invite_code text,
  status text,
  created_at timestamp with time zone,
  expires_at timestamp with time zone,
  used_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY INVOKER  -- Use SECURITY INVOKER instead of DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    i.id,
    i.invite_code,
    CASE 
      WHEN i.used_at IS NOT NULL THEN 'Used'
      WHEN i.expires_at < now() THEN 'Expired'
      ELSE 'Active'
    END as status,
    i.created_at,
    i.expires_at,
    i.used_at
  FROM public.invites i
  WHERE i.created_by = auth.uid()
  ORDER BY i.created_at DESC;
$$;