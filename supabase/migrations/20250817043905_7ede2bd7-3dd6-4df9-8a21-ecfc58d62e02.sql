-- Create storage bucket for knowledge files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'knowledge-files', 
  'knowledge-files', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown', 'application/json']
);

-- Create knowledge_bases table to organize knowledge by topic/category
CREATE TABLE public.knowledge_bases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge_files table to track uploaded files
CREATE TABLE public.knowledge_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_base_id UUID NOT NULL REFERENCES public.knowledge_bases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  processed_content TEXT, -- Extracted text content
  processing_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge_chunks table for vector storage
CREATE TABLE public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_file_id UUID NOT NULL REFERENCES public.knowledge_files(id) ON DELETE CASCADE,
  knowledge_base_id UUID NOT NULL REFERENCES public.knowledge_bases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI embeddings dimension
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_bases
CREATE POLICY "Users can view their own knowledge bases" 
ON public.knowledge_bases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge bases" 
ON public.knowledge_bases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge bases" 
ON public.knowledge_bases 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge bases" 
ON public.knowledge_bases 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for knowledge_files
CREATE POLICY "Users can view their own knowledge files" 
ON public.knowledge_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge files" 
ON public.knowledge_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge files" 
ON public.knowledge_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge files" 
ON public.knowledge_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for knowledge_chunks
CREATE POLICY "Users can view their own knowledge chunks" 
ON public.knowledge_chunks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge chunks" 
ON public.knowledge_chunks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge chunks" 
ON public.knowledge_chunks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge chunks" 
ON public.knowledge_chunks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Storage policies for knowledge files
CREATE POLICY "Users can upload their own knowledge files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own knowledge files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own knowledge files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own knowledge files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for performance
CREATE INDEX idx_knowledge_bases_user_id ON public.knowledge_bases(user_id);
CREATE INDEX idx_knowledge_bases_agent_id ON public.knowledge_bases(agent_id);
CREATE INDEX idx_knowledge_files_knowledge_base_id ON public.knowledge_files(knowledge_base_id);
CREATE INDEX idx_knowledge_files_user_id ON public.knowledge_files(user_id);
CREATE INDEX idx_knowledge_chunks_knowledge_base_id ON public.knowledge_chunks(knowledge_base_id);
CREATE INDEX idx_knowledge_chunks_user_id ON public.knowledge_chunks(user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_knowledge_bases_updated_at
BEFORE UPDATE ON public.knowledge_bases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_files_updated_at
BEFORE UPDATE ON public.knowledge_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;