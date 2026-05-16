import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)

export type Ride = {
  id: string
  passenger: string
  phone: string
  pickup: string
  destination: string
  date: string
  time: string
  notes?: string
  status: string
  driver?: string
  fare?: string
  created_at: string
}
