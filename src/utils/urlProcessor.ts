interface UrlProcessResult {
  success: boolean;
  content?: string;
  title?: string;
  error?: string;
}

export class UrlProcessor {
  static async processUrl(url: string): Promise<UrlProcessResult> {
    try {
      // Validate URL
      new URL(url);
      
      // Check if it's a Google Docs URL and convert it
      const processedUrl = this.convertGoogleDocsUrl(url);
      
      // Fetch content
      const response = await fetch(processedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; KnowledgeBaseBot/1.0)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      // Extract title and clean content
      const title = this.extractTitle(content, url);
      const cleanContent = this.cleanContent(content, processedUrl);
      
      return {
        success: true,
        content: cleanContent,
        title
      };
    } catch (error) {
      console.error('Error processing URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process URL'
      };
    }
  }
  
  static convertGoogleDocsUrl(url: string): string {
    // Convert Google Docs URLs to plain text export format
    const googleDocsRegex = /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(googleDocsRegex);
    
    if (match) {
      const docId = match[1];
      return `https://docs.google.com/document/d/${docId}/export?format=txt`;
    }
    
    return url;
  }
  
  static extractTitle(content: string, url: string): string {
    // Try to extract title from HTML
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // Fallback to URL
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'Untitled Document';
    }
  }
  
  static cleanContent(content: string, url: string): string {
    // For Google Docs plain text export, return as-is
    if (url.includes('docs.google.com') && url.includes('export?format=txt')) {
      return content;
    }
    
    // Basic HTML cleaning
    return content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  static isGoogleDocsUrl(url: string): boolean {
    return /https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/.test(url);
  }
  
  static validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'Only HTTP and HTTPS URLs are supported' };
      }
      
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }
}