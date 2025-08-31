-- Update subscription_plans RLS policy to require authentication and hide sensitive data
DROP POLICY IF EXISTS "subscription_plans_public_read" ON public.subscription_plans;

-- Create a more restrictive policy that requires authentication
CREATE POLICY "authenticated_users_can_view_active_plans" ON public.subscription_plans
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NOT NULL
);

-- Create a safe view for public pricing data that doesn't expose sensitive Stripe details
CREATE OR REPLACE VIEW public.public_pricing_plans AS
SELECT 
  id,
  name,
  description,
  price_monthly,
  price_yearly,
  features,
  conversation_limit,
  is_active,
  created_at,
  updated_at
FROM public.subscription_plans
WHERE is_active = true;

-- Allow public access to the safe view
GRANT SELECT ON public.public_pricing_plans TO anon, authenticated;