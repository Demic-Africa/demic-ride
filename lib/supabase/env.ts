/**
 * Single place that reads Supabase env vars.
 * Throws a clear error at call-time (not import-time) if something is missing.
 * This is the fix for the class of bug where a missing key kills `next build`
 * during "Collecting page data".
 */

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL is not set')
  return url
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  return key
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      '[supabase] SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'This is required for admin operations. Add it to .env.local and to your deploy env.'
    )
  }
  return key
}
