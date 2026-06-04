# Demic Ride — Copilot Instructions

## Project context
Demic Ride is a corporate mobility and dispatch platform for African transport operators. Priority is production-ready code that works reliably.

## Architecture preferences
- Framework: Next.js 15+ with App Router
- Database: Supabase (PostgreSQL)
- Realtime: Supabase Realtime subscriptions
- Styling: Tailwind CSS
- Mobile: Capacitor (Android shell)

## Code generation rules

**Always:**
- Use strict TypeScript (no `any`)
- Prefer server components unless client interactivity is required
- Generate error boundaries for async operations
- Include loading states for data fetching
- Use environment variables for all secrets

**Never:**
- Hardcode API keys
- Ignore null/undefined cases
- Skip error handling in try/catch blocks

## Business logic
Ride status flow: requested → assigned → en_route → completed/cancelled
Payment types: cash (post-ride) or corporate account
