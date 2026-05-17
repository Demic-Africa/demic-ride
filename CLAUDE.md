# CLAUDE.md — Demic Ride

## Project
Corporate taxi dispatch and ride-hailing platform for Demic Tours Africa.
Live: https://ride.demicafrica.com

## Stack
- **Framework**: Next.js (App Router, TypeScript)
- **Database**: Supabase (Postgres + Realtime + Auth)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (auto-deploys on push to main)
- **SMS/OTP**: AfricasTalking (Kenya)
- **Maps**: Google Maps or OpenStreetMap

## Repo Structure
- `app/` — Next.js App Router pages and layouts
- `lib/` — Supabase client, utilities, helpers
- `public/` — Static assets, PWA icons/manifest

## Environment Variables
Never commit secrets. Required vars live in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Key Features
1. **Ride Booking** — passenger books ride with pickup/dropoff
2. **Driver Dispatch** — admin assigns driver to booking
3. **Operations Dashboard** — real-time ride status, admin controls
4. **Audit Trail** — all actions logged
5. **PWA** — installable on mobile home screen

## Users/Roles
- `passenger` — books rides
- `driver` — receives assignments, updates status
- `admin` — full dashboard, dispatch, CSV export

## Coding Rules
- TypeScript strict mode — no `any`
- Use Supabase Realtime for live updates (not polling)
- All DB access through `lib/supabase.ts` client
- Mobile-first Tailwind — test at 375px width
- Never expose service role key to client components
- Use Server Components for data fetching where possible
- Errors must be caught and shown to user — no silent failures

## Git Workflow
- Branch from `main` for each feature/fix
- PR title format: `feat:`, `fix:`, `chore:`
- Vercel previews deploy automatically on PR
- Merge to `main` = production deploy

## Current Priorities
1. Improve real-time driver location tracking
2. SMS notifications to passengers on dispatch
3. Driver mobile UI improvements
4. Booking history for passengers

## Do Not
- Do not change Supabase schema without migration file
- Do not remove PWA manifest or service worker
- Do not break the CSV export in admin dashboard
- Do not use `pages/` router — this is App Router only
