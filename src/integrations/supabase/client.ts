import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Single Supabase client — handles both auth and database
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    storageKey: 'sb-auth-token',
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Aliases kept for backward compatibility — all three names point to the same client
export const authClient = supabase;
export const dbClient = supabase;
