import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const configured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = configured ? createBrowserClient(supabaseUrl!, supabaseAnonKey!) : null;
