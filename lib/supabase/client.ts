'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from './env'

let cached: SupabaseClient | null = null

/**
 * Browser-side Supabase client. Safe to call from 'use client' components.
 * Uses the anon key — RLS applies. Memoized per browser session.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (cached) return cached
  cached = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { persistSession: true, autoRefreshToken: true },
  })
  return cached
}
