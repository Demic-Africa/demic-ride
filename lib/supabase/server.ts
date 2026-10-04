import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from './env'

/**
 * Server-side Supabase client using the anon key.
 * Use this in API routes and Server Components when you want RLS to apply
 * as the anonymous user (same behaviour as the old module-scope client).
 *
 * NOTE: creates a new client per call. Do NOT cache across requests —
 * serverless invocations must not share state.
 */
export function getSupabaseServer(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
