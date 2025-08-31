-- Fix the security definer view issue by removing the view and using a function instead
DROP VIEW IF EXISTS public.public_pricing_plans;

-- Create a secure function to get public pricing plans instead of a view
CREATE OR REPLACE FUNCTION public.get_public_pricing_plans()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  price_monthly integer,
  price_yearly integer,
  features jsonb,
  conversation_limit integer,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    sp.description,
    sp.price_monthly,
    sp.price_yearly,
    sp.features,
    sp.conversation_limit,
    sp.is_active,
    sp.created_at,
    sp.updated_at
  FROM public.subscription_plans sp
  WHERE sp.is_active = true;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_pricing_plans() TO anon, authenticated;