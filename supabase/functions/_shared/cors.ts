// Shared CORS configuration for Edge Functions
// Restricts origins to allowed domains for defense-in-depth

const ALLOWED_ORIGINS = [
  'https://dollyland-ai.lovable.app',
  'https://dollyland.ai',
  'https://www.dollyland.ai',
  'https://fzdetwatsinsftunljir.supabase.co',
];

// Include localhost origins for development
const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

// Get all allowed origins based on environment
function getAllowedOrigins(): string[] {
  const isDev = Deno.env.get('DENO_ENV') !== 'production';
  return isDev ? [...ALLOWED_ORIGINS, ...DEV_ORIGINS] : ALLOWED_ORIGINS;
}

// Validate if an origin is allowed
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return getAllowedOrigins().some(allowed => origin === allowed || origin.endsWith('.lovable.app'));
}

// Get CORS headers for a specific origin
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin) ? origin! : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  };
}

// Handle CORS preflight requests
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    return new Response(null, { headers: getCorsHeaders(origin) });
  }
  return null;
}

// Legacy wildcard CORS headers for backwards compatibility
// Note: Still used by some functions that need unrestricted access
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
