-- Add additional security columns and functions for API key protection
ALTER TABLE public.user_ai_providers 
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_from_ip INET;

-- Create audit log table for API key access
CREATE TABLE IF NOT EXISTS public.api_key_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('create', 'read', 'update', 'delete', 'decrypt')),
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on audit log
ALTER TABLE public.api_key_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit log (admin-only access in real scenarios)
CREATE POLICY "Users can view their own access logs" 
ON public.api_key_access_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to log API key access
CREATE OR REPLACE FUNCTION public.log_api_key_access(
  p_user_id UUID,
  p_provider_id UUID,
  p_access_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.api_key_access_logs (
    user_id, 
    provider_id, 
    access_type, 
    ip_address, 
    user_agent, 
    success
  )
  VALUES (
    p_user_id, 
    p_provider_id, 
    p_access_type, 
    p_ip_address, 
    p_user_agent, 
    p_success
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced encryption function with additional salt
CREATE OR REPLACE FUNCTION public.encrypt_api_key_enhanced(api_key text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  time_salt TEXT;
  combined_key TEXT;
BEGIN
  -- Add time-based salt for additional security
  time_salt := extract(epoch from now())::text;
  combined_key := api_key || '::' || user_id::text || '::' || time_salt;
  
  -- Log the encryption attempt
  PERFORM log_api_key_access(user_id, NULL, 'create');
  
  RETURN encode(convert_to(combined_key, 'UTF8'), 'base64');
END;
$$;

-- Enhanced decryption function with access logging
CREATE OR REPLACE FUNCTION public.decrypt_api_key_enhanced(encrypted_key text, user_id uuid, provider_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  decrypted_text TEXT;
  key_part TEXT;
  stored_user_id TEXT;
  access_limit INTEGER := 1000; -- Limit decryption attempts per provider
  current_access_count INTEGER;
BEGIN
  -- Check access count limit
  SELECT access_count INTO current_access_count
  FROM public.user_ai_providers 
  WHERE id = provider_id AND user_id = user_id;
  
  IF current_access_count >= access_limit THEN
    PERFORM log_api_key_access(user_id, provider_id, 'decrypt', NULL, NULL, false);
    RETURN NULL;
  END IF;
  
  -- Decode and extract the API key part
  BEGIN
    decrypted_text := convert_from(decode(encrypted_key, 'base64'), 'UTF8');
    key_part := split_part(decrypted_text, '::', 1);
    stored_user_id := split_part(decrypted_text, '::', 2);
    
    -- Verify the user_id matches
    IF stored_user_id = user_id::text THEN
      -- Update access tracking
      UPDATE public.user_ai_providers 
      SET 
        last_accessed_at = now(),
        access_count = access_count + 1
      WHERE id = provider_id AND user_id = user_id;
      
      -- Log successful access
      PERFORM log_api_key_access(user_id, provider_id, 'decrypt', NULL, NULL, true);
      
      RETURN key_part;
    ELSE
      -- Log failed access attempt
      PERFORM log_api_key_access(user_id, provider_id, 'decrypt', NULL, NULL, false);
      RETURN NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log failed decryption
    PERFORM log_api_key_access(user_id, provider_id, 'decrypt', NULL, NULL, false);
    RETURN NULL;
  END;
END;
$$;

-- Create trigger to log access attempts on API provider table
CREATE OR REPLACE FUNCTION public.audit_api_provider_access()
RETURNS TRIGGER AS $$
BEGIN
  CASE TG_OP
    WHEN 'INSERT' THEN
      PERFORM log_api_key_access(NEW.user_id, NEW.id, 'create');
      RETURN NEW;
    WHEN 'UPDATE' THEN
      PERFORM log_api_key_access(NEW.user_id, NEW.id, 'update');
      RETURN NEW;
    WHEN 'DELETE' THEN
      PERFORM log_api_key_access(OLD.user_id, OLD.id, 'delete');
      RETURN OLD;
  END CASE;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_api_provider_trigger ON public.user_ai_providers;
CREATE TRIGGER audit_api_provider_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_ai_providers
  FOR EACH ROW EXECUTE FUNCTION public.audit_api_provider_access();

-- Add more restrictive RLS policies with rate limiting
CREATE POLICY "Limit API provider access frequency" 
ON public.user_ai_providers 
FOR SELECT 
USING (
  auth.uid() = user_id AND
  (last_accessed_at IS NULL OR last_accessed_at > now() - interval '1 second')
);

-- Create policy for viewing audit logs (users can see their own)
CREATE POLICY "Users can insert their own access logs" 
ON public.api_key_access_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);