import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vplpcitffpwsjdczsvnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbHBjaXRmZnB3c2pkY3pzdm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTY3OTgsImV4cCI6MjA4ODg3Mjc5OH0.zDMczh4NMUzakcSkqr4ZT72RSqdmv3IzScf30iVZKbY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    detectSessionInUrl: true,
  },
});
