-- Add support for URL-based knowledge sources
ALTER TABLE knowledge_files 
ADD COLUMN source_type text NOT NULL DEFAULT 'file',
ADD COLUMN source_url text,
ADD CONSTRAINT knowledge_files_source_type_check 
  CHECK (source_type IN ('file', 'url', 'google_doc'));

-- Add index for better performance
CREATE INDEX idx_knowledge_files_source_type ON knowledge_files(source_type);

-- Update existing records to have proper source_type
UPDATE knowledge_files SET source_type = 'file' WHERE source_type IS NULL;