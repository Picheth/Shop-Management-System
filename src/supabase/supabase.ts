// supabase.ts (or your utility file)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Export as a single constant to be reused
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// In other files, import this instance instead of calling createClient again:
// import { supabase } from './supabase'