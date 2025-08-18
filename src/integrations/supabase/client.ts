// SECURITY: Use environment variables instead of hardcoded credentials
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fzdetwatsinsftunljir.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6ZGV0d2F0c2luc2Z0dW5samlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg0MjIsImV4cCI6MjA3MDk3NDQyMn0.dD_MP3Ek4ivbItUc8KQLAsFseyVKcaOF7SXr0A9lE7U";

// NOTE: These are public keys safe for client-side use
// For production, consider additional security measures

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});