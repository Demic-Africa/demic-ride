/**
 * @deprecated
 * Compatibility shim. Import from '@/lib/supabase/client' or
 * '@/lib/supabase/server' directly in new code.
 *
 * This file exists so pre-existing imports of `{ supabase }` from '@/lib/supabase'
 * keep working. It lazily resolves to the browser client on first access.
 */

import { getSupabaseBrowser } from './supabase/client'

// Lazy proxy: forwards property access to the singleton browser client.
// First access triggers getSupabaseBrowser() which reads env at call-time.
export const supabase = new Proxy({} as ReturnType<typeof getSupabaseBrowser>, {
  get(_target, prop) {
    const client = getSupabaseBrowser() as any
    const value = client[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
