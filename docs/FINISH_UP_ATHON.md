# GitHub Finish-Up-A-Thon Journal — Demic Ride

**Repository:** https://github.com/Demic-Africa/demic-ride  
**Challenge period:** June 4-11, 2026  
**Participant:** @mufasa528  

## Why this project

Demic Ride is Demic Tours Africa's corporate mobility platform. An MVP shipped to production, but critical bugs remain and operational features are incomplete. This challenge closes that gap using GitHub Copilot.

## Baseline — BEFORE state (June 4, 2026)

**Already in production:**
- Ride booking UI, driver dispatch, admin dashboard
- GPS autocomplete, live tracking, pay-after-ride flow
- Google/Apple social login, PWA, Capacitor Android shell
- Supabase backend, Vercel CI/CD

**🚨 CRITICAL BUG DISCOVERED:**
During before-screenshot capture, I discovered the live platform's core feature is broken:

| Issue | Details |
|-------|---------|
| Location | https://ride.demicafrica.com/book |
| Action | Fill ride request → click "Request Ride" |
| Result | "Submission failed. Check your connection and Supabase env vars." |
| Impact | Platform cannot accept ride bookings in production |

**Evidence:** `docs/screenshots/before/03-book-FAILED.png`

## Challenge work — AFTER (built with GitHub Copilot)

1. **Fix production booking bug** (Priority #1)
2. Operations analytics dashboard
3. Test coverage for booking + dispatch
4. Full README + architecture docs
5. AI dispatch assistant (stretch)

## Copilot evidence

See `docs/copilot/` — each interaction captured as: prompt → suggestion → final implementation.

## Before screenshots captured

| # | File | Content |
|---|------|---------|
| 01 | `01-home.png` | Home page |
| 02 | `02-book-empty.png` | Booking form (empty) |
| 03 | `03-book-FAILED.png` | **Submission error proof** |
| 04 | `04-book-filled.png` | Booking form (filled) |
| 05 | `05-admin-gate.png` | Admin login/dashboard |
| 06 | `06-driver-empty.png` | Driver view |

All stored in `docs/screenshots/before/`
