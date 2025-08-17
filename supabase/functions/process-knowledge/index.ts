import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequest {
  fileId?: string;
  knowledgeBaseId?: string;
  batchProcess?: boolean;
}

interface FirecrawlApp {
  scrapeUrl(url: string, options?: any): Promise<any>;
}

// Firecrawl implementation
class FirecrawlService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async scrapeUrl(url: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown', 'html'],
          onlyMainContent: true,
          includeTags: ['title', 'meta'],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Firecrawl API error:', errorText);
        return { success: false, error: `API error: ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error scraping URL:', error);
      return { success: false, error: error.message };
    }
  }
}

// PDF text extraction using browser APIs
async function extractTextFromPdf(fileContent: Uint8Array): Promise<string> {
  try {
    // Simple PDF text extraction - in production, use a proper PDF library
    const decoder = new TextDecoder();
    const text = decoder.decode(fileContent);
    
    // Extract readable text from PDF (basic implementation)
    const textRegex = /stream\s*(.+?)\s*endstream/gs;
    let extractedText = '';
    let match;
    
    while ((match = textRegex.exec(text)) !== null) {
      const streamContent = match[1];
      // Remove PDF formatting codes and extract readable text
      const cleanText = streamContent
        .replace(/[^\w\s\.\,\!\?]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanText.length > 10) {
        extractedText += cleanText + ' ';
      }
    }
    
    return extractedText.trim() || 'Could not extract text from PDF';
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return 'Error extracting PDF text';
  }
}

// Chunk text content for AI processing
function chunkContent(content: string, chunkSize: number = 1000): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence.trim() + '.';
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence.trim() + '.';
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Only keep meaningful chunks
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { fileId, knowledgeBaseId, batchProcess } = await req.json() as ProcessRequest;

    console.log('Processing request:', { fileId, knowledgeBaseId, batchProcess });

    let filesToProcess = [];

    if (batchProcess && knowledgeBaseId) {
      // Process all pending files in the knowledge base
      const { data: files, error } = await supabase
        .from('knowledge_files')
        .select('*')
        .eq('knowledge_base_id', knowledgeBaseId)
        .eq('processing_status', 'pending');

      if (error) {
        console.error('Error fetching pending files:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch pending files' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      filesToProcess = files || [];
    } else if (fileId) {
      // Process single file
      const { data: file, error } = await supabase
        .from('knowledge_files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (error || !file) {
        console.error('Error fetching file:', error);
        return new Response(JSON.stringify({ error: 'File not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      filesToProcess = [file];
    } else {
      return new Response(JSON.stringify({ error: 'fileId or knowledgeBaseId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${filesToProcess.length} files`);

    // Process files in parallel
    const processingPromises = filesToProcess.map(async (file) => {
      try {
        // Update status to processing
        await supabase
          .from('knowledge_files')
          .update({ processing_status: 'processing' })
          .eq('id', file.id);

        let content = '';
        let title = file.file_name;

        if (file.source_type === 'url') {
          // Process URL using Firecrawl
          if (!firecrawlApiKey) {
            throw new Error('Firecrawl API key not configured');
          }

          const firecrawl = new FirecrawlService(firecrawlApiKey);
          const result = await firecrawl.scrapeUrl(file.source_url);

          if (!result.success) {
            throw new Error(result.error || 'Failed to scrape URL');
          }

          content = result.data?.markdown || result.data?.content || '';
          title = result.data?.metadata?.title || file.source_url;
        } else {
          // Process file from storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('knowledge-files')
            .download(file.file_path);

          if (downloadError) {
            throw new Error(`Failed to download file: ${downloadError.message}`);
          }

          const fileContent = new Uint8Array(await fileData.arrayBuffer());

          if (file.mime_type.includes('pdf')) {
            content = await extractTextFromPdf(fileContent);
          } else {
            // For text files, markdown, etc.
            const decoder = new TextDecoder();
            content = decoder.decode(fileContent);
          }
        }

        if (!content || content.trim().length < 10) {
          throw new Error('No content extracted from file');
        }

        // Update file with processed content
        await supabase
          .from('knowledge_files')
          .update({ 
            processed_content: content,
            processing_status: 'chunking'
          })
          .eq('id', file.id);

        // Create chunks
        const chunks = chunkContent(content);
        console.log(`Created ${chunks.length} chunks for file ${file.id}`);

        // Insert chunks into database
        const chunkInserts = chunks.map((chunk, index) => ({
          knowledge_file_id: file.id,
          knowledge_base_id: file.knowledge_base_id,
          user_id: file.user_id,
          content: chunk,
          chunk_index: index,
          metadata: {
            title,
            source_type: file.source_type,
            source_url: file.source_url,
            file_name: file.file_name,
            chunk_size: chunk.length,
            total_chunks: chunks.length
          }
        }));

        const { error: chunkError } = await supabase
          .from('knowledge_chunks')
          .insert(chunkInserts);

        if (chunkError) {
          console.error('Error inserting chunks:', chunkError);
          throw new Error('Failed to create knowledge chunks');
        }

        // Mark as completed
        await supabase
          .from('knowledge_files')
          .update({ processing_status: 'completed' })
          .eq('id', file.id);

        console.log(`Successfully processed file ${file.id} with ${chunks.length} chunks`);
        return { success: true, fileId: file.id, chunksCreated: chunks.length };

      } catch (error) {
        console.error(`Error processing file ${file.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('knowledge_files')
          .update({ 
            processing_status: 'failed',
            processed_content: `Error: ${error.message}`
          })
          .eq('id', file.id);

        return { success: false, fileId: file.id, error: error.message };
      }
    });

    const results = await Promise.all(processingPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Processing complete: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      successful,
      failed,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-knowledge function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});