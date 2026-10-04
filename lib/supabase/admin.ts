import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceRoleKey } from './env'

/**
 * Service-role client. BYPASSES RLS. Only use in:
 *   - server-side API routes you fully control
 *   - background jobs / cron
 *   - webhook handlers
 *
 * Never import this into a 'use client' file. Never expose the service role key.
 */
export function getSupabaseAdmin(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
