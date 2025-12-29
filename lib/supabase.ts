import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qouczenikymlirjqwktn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdWN6ZW5pa3ltbGlyanF3a3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTU4NDQsImV4cCI6MjA4MTgzMTg0NH0.L9rnkA9zCuIv7qubN076eav4Z4a6esq_U1wUHs2u7oc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
