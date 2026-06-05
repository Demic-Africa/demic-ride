# Demic Ride

**Corporate Taxi Dispatch & Ride-Hailing Platform** for African transport operators.

Built with Next.js, Supabase, and Tailwind CSS. Deployed on **Render**.

🔗 **Live:** [ride.demicafrica.com](https://ride.demicafrica.com)

---

## Problem

Transport operators in Africa rely on fragmented tools:
- WhatsApp groups for bookings
- Phone calls for dispatch
- Spreadsheets for tracking

This leads to:
- Lost bookings
- Delayed driver assignment
- No visibility into operations
- Poor customer experience

---

## Solution

Demic Ride centralizes everything in one platform:

| Feature | Description |
|---------|-------------|
| **Instant Booking** | Passengers book rides with pickup/destination autocomplete |
| **Smart Dispatch** | Nearest available driver assigned automatically |
| **Live Tracking** | Real-time GPS tracking of assigned driver |
| **Pay After Ride** | Corporate billing, no upfront payment |
| **PWA + Android** | Works offline, installable as app |
| **Admin Dashboard** | Full visibility into rides, drivers, revenue |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15+ (App Router) |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (Google/Apple) |
| Styling | Tailwind CSS |
| Maps | Leaflet / OpenStreetMap |
| Mobile | Capacitor (Android shell) |
| Deployment | Render |

---

## Finish-Up-A-Thon Journey

During GitHub's Finish-Up-A-Thon challenge, we fixed:

1. **Database schema** - Added `scheduled_date`, `scheduled_time`, `notes` columns
2. **Validation** - Date/time now required with inline errors
3. **Error handling** - Dispatch failures don't break booking flow
4. **Analytics dashboard** - Fleet metrics at `/admin/dashboard`

**GitHub Copilot** helped generate migrations, validation logic, error handling patterns, and the analytics dashboard.

---

## Local Development

```bash
git clone https://github.com/Demic-Africa/demic-ride.git
cd demic-ride
npm install
cp .env.example .env.local
npm run dev

Deployment
Deployed on Render. Push to main branch triggers auto-deployment.

Required environment variables:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

Roadmap
AI dispatch assistant

Driver mobile app

SMS notifications

Revenue reporting

Maintainers
Developed and maintained by Demic Tours Africa
