-- Remove duplicate subscription plans and keep only the latest ones
-- First, disable the old duplicate plans
UPDATE subscription_plans 
SET is_active = false 
WHERE id IN (
  'df8f12be-6ad0-4fe8-80e9-a2f31e69f53c', -- Old Free
  'a99bd2a2-fbbe-4c1f-9622-00c0f3bfb842', -- Old Starter  
  '7164ef5a-00b1-4b1e-9e84-3117e4886589'  -- Old Pro
);

-- Update the remaining plans to have better pricing structure
UPDATE subscription_plans 
SET 
  price_yearly = 0,
  features = '["20 conversations per month", "Access to public agents", "Basic support", "Perfect for getting started"]'::jsonb
WHERE id = '5cca0ee1-f4b1-424d-82f8-8e15a0c8f4b2'; -- Keep this Free plan

UPDATE subscription_plans 
SET 
  conversation_limit = 500,
  features = '["500 conversations per month", "Access to all agents", "Create unlimited agents", "Priority support", "Creator revenue sharing"]'::jsonb
WHERE id = '8866a8ab-0ffc-4099-b8bb-065b12a1d0d2'; -- Keep this Starter plan

UPDATE subscription_plans 
SET 
  conversation_limit = null,
  features = '["Unlimited conversations", "Access to all agents", "Create unlimited agents", "Premium support", "Creator revenue sharing", "Advanced analytics", "API access"]'::jsonb  
WHERE id = '11215f33-68cb-496c-94bf-b0578f872151'; -- Keep this Pro plan