import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qtiakfqqfqbghytgzlcq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0aWFrZnFxZnFiZ2h5dGd6bGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTI5NjQsImV4cCI6MjA2NjU4ODk2NH0.UhC8V4R4E2DhG0Tn27KZYnqojI1YKjM3imJ_HB6vlLc';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});