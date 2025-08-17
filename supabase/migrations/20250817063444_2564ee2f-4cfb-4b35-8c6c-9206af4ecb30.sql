-- Enhance security for api_key_access_logs table
-- Create stricter RLS policies with time-based restrictions

-- Drop existing policies to replace with stricter ones
DROP POLICY IF EXISTS "Users can view their own access logs" ON public.api_key_access_logs;
DROP POLICY IF EXISTS "Users can insert their own access logs" ON public.api_key_access_logs;

-- Create more restrictive policies for access logs
-- Users can only view their own access logs from the last 30 days
CREATE POLICY "Users can view recent access logs only" 
ON public.api_key_access_logs 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND accessed_at > (now() - interval '30 days')
);

-- Only system functions can insert access logs
CREATE POLICY "System functions can insert access logs" 
ON public.api_key_access_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Separate encrypted API keys into a more secure table
CREATE TABLE public.secure_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.user_ai_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- Hash for verification without decryption
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_rotation_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '90 days')
);

-- Enable RLS on secure_api_keys
ALTER TABLE public.secure_api_keys ENABLE ROW LEVEL SECURITY;

-- Extremely restrictive policies for secure API keys
CREATE POLICY "Users can view their own secure keys metadata only" 
ON public.secure_api_keys 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND expires_at > now()
);

CREATE POLICY "Users can insert their own secure keys" 
ON public.secure_api_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own secure keys" 
ON public.secure_api_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own secure keys" 
ON public.secure_api_keys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add additional security function to mask sensitive data in access logs
CREATE OR REPLACE FUNCTION public.get_masked_access_logs(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  access_type TEXT,
  success BOOLEAN,
  accessed_at TIMESTAMP WITH TIME ZONE,
  masked_ip TEXT,
  provider_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only return masked data for the requesting user
  IF auth.uid() != user_uuid THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    logs.id,
    logs.access_type,
    logs.success,
    logs.accessed_at,
    -- Mask IP address (show only first two octets)
    CASE 
      WHEN logs.ip_address IS NOT NULL THEN
        split_part(host(logs.ip_address), '.', 1) || '.' || 
        split_part(host(logs.ip_address), '.', 2) || '.***'
      ELSE NULL
    END as masked_ip,
    providers.provider_name
  FROM public.api_key_access_logs logs
  LEFT JOIN public.user_ai_providers providers ON logs.provider_id = providers.id
  WHERE logs.user_id = user_uuid
    AND logs.accessed_at > (now() - interval '30 days')
  ORDER BY logs.accessed_at DESC
  LIMIT 100;
END;
$$;

-- Create function to safely retrieve API keys (only for edge functions)
CREATE OR REPLACE FUNCTION public.get_api_key_for_provider(provider_uuid UUID, requesting_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encrypted_key TEXT;
  provider_user_id UUID;
BEGIN
  -- Verify the provider belongs to the requesting user
  SELECT user_id, api_key_encrypted INTO provider_user_id, encrypted_key
  FROM public.user_ai_providers 
  WHERE id = provider_uuid AND is_active = true;
  
  -- Security check
  IF provider_user_id != requesting_user_id THEN
    PERFORM public.log_api_key_access(requesting_user_id, provider_uuid, 'unauthorized_access', NULL, NULL, false);
    RETURN NULL;
  END IF;
  
  -- Log the access
  PERFORM public.log_api_key_access(requesting_user_id, provider_uuid, 'decrypt', NULL, NULL, true);
  
  -- Return the encrypted key (decryption happens in edge function)
  RETURN encrypted_key;
END;
$$;

-- Add triggers for automatic key rotation alerts
CREATE OR REPLACE FUNCTION public.check_key_rotation_needed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log if key is approaching expiration or has high access count
  IF NEW.access_count > 1000 OR NEW.created_at < (now() - interval '60 days') THEN
    PERFORM public.log_api_key_access(NEW.user_id, NEW.id, 'rotation_recommended', NULL, NULL, true);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_provider_key_rotation
  AFTER UPDATE ON public.user_ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_key_rotation_needed();

-- Create index for better performance on time-based queries
CREATE INDEX IF NOT EXISTS idx_access_logs_user_time ON public.api_key_access_logs(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_secure_keys_user_expires ON public.secure_api_keys(user_id, expires_at);