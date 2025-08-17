-- Create user AI provider preferences table
CREATE TABLE public.user_ai_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_name TEXT NOT NULL, -- 'openai', 'deepseek', 'anthropic', etc.
  api_key_encrypted TEXT NOT NULL, -- Encrypted API key
  model_name TEXT NOT NULL, -- 'gpt-4o-mini', 'deepseek-chat', etc.
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_name TEXT, -- User-friendly name like "My OpenAI (GPT-4)"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_ai_providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_ai_providers
CREATE POLICY "Users can view their own AI providers" 
ON public.user_ai_providers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI providers" 
ON public.user_ai_providers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI providers" 
ON public.user_ai_providers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI providers" 
ON public.user_ai_providers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_ai_providers_user_id ON public.user_ai_providers(user_id);
CREATE INDEX idx_user_ai_providers_default ON public.user_ai_providers(user_id, is_default) WHERE is_default = true;

-- Create trigger for updated_at
CREATE TRIGGER update_user_ai_providers_updated_at
BEFORE UPDATE ON public.user_ai_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add agent-specific AI provider preferences (optional override)
ALTER TABLE public.agents 
ADD COLUMN ai_provider_id UUID REFERENCES public.user_ai_providers(id) ON DELETE SET NULL;

-- Create function to encrypt/decrypt API keys (basic encryption for demo)
CREATE OR REPLACE FUNCTION public.encrypt_api_key(api_key TEXT, user_id UUID)
RETURNS TEXT AS $$
BEGIN
  -- Simple base64 encoding with user_id salt (in production, use proper encryption)
  RETURN encode(convert_to(api_key || '::' || user_id::text, 'UTF8'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  decrypted_text TEXT;
  key_part TEXT;
BEGIN
  -- Decode and extract the API key part
  decrypted_text := convert_from(decode(encrypted_key, 'base64'), 'UTF8');
  key_part := split_part(decrypted_text, '::', 1);
  
  -- Verify the user_id matches
  IF split_part(decrypted_text, '::', 2) = user_id::text THEN
    RETURN key_part;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;