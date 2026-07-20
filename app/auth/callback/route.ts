// app/auth/callback/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time Supabase calls
export const dynamic = 'force-dynamic'
export const runtime = 'edge' // Optional: use edge runtime for faster responses

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing')
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }

    // Redirect to the next page or home
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }
}
