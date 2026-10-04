-- 20251004_baseline_schema.sql
-- ---------------------------------------------------------------------------
-- Snapshot of the Demic Ride schema as of 2026-10-04.
--
-- This is the FIRST migration in the repo that actually documents tables.
-- Before this file, `bookings`, `drivers`, `status_logs`, and `rides` were
-- created ad-hoc via the Supabase dashboard, and the only migration in git
-- added three columns to a table that had no CREATE statement.
--
-- From this commit forward, this file is the source of truth for the schema.
-- Every subsequent change must be a new numbered migration file.
--
-- Idempotent: safe to run against the existing prod DB (uses IF NOT EXISTS,
-- DROP POLICY IF EXISTS, and a DO block for the FK). Also safe on a fresh DB.
--
-- Deprecated: `rides` was renamed to `_legacy_rides` on 2026-10-04.
-- It still exists for reference. Do not write to it. It will be dropped in a
-- future migration once nothing references it.
-- ---------------------------------------------------------------------------


-- ===========================================================================
-- 1. Tables
-- ===========================================================================

create table if not exists public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  passenger_name     text,
  passenger_phone    text,
  pickup_address     text not null,
  destination_address text not null,
  pickup_lat         double precision,
  pickup_lng         double precision,
  destination_lat    double precision,
  destination_lng    double precision,
  status             text default 'pending'::text,
  driver_id          uuid,
  dispatch_method    text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  scheduled_date     date,
  scheduled_time     time without time zone,
  notes              text,
  email              text,
  amount             numeric default 0,
  language_preference text default 'en'::text
);

create table if not exists public.drivers (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  phone                 text,
  vehicle               text,
  vehicle_plate         text,
  current_lat           double precision,
  current_lng           double precision,
  last_location_update  timestamptz,
  status                text default 'available'::text,
  created_at            timestamptz default now()
);

create table if not exists public.status_logs (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid,
  status      text not null,
  "timestamp" timestamptz default now()
);


-- ===========================================================================
-- 2. Foreign keys
-- ===========================================================================

-- status_logs.booking_id -> bookings.id
-- (already exists in prod; block guards for fresh DBs)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'status_logs_booking_id_fkey'
      and table_name = 'status_logs'
      and constraint_type = 'FOREIGN KEY'
  ) then
    alter table public.status_logs
      add constraint status_logs_booking_id_fkey
      foreign key (booking_id) references public.bookings(id)
      on delete cascade;
  end if;
end $$;

-- bookings.driver_id -> drivers.id
-- (did NOT exist before 2026-10-04; orphan check confirmed zero bad rows)
-- on delete set null: deleting a driver clears the assignment but keeps the booking.
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'bookings_driver_id_fkey'
      and table_name = 'bookings'
      and constraint_type = 'FOREIGN KEY'
  ) then
    alter table public.bookings
      add constraint bookings_driver_id_fkey
      foreign key (driver_id) references public.drivers(id)
      on delete set null;
  end if;
end $$;


-- ===========================================================================
-- 3. Indexes (hot query paths)
-- ===========================================================================

create index if not exists idx_bookings_status         on public.bookings(status);
create index if not exists idx_bookings_created_at     on public.bookings(created_at desc);
create index if not exists idx_bookings_driver_id      on public.bookings(driver_id);
create index if not exists idx_bookings_scheduled_date on public.bookings(scheduled_date);
create index if not exists idx_drivers_status          on public.drivers(status);
create index if not exists idx_status_logs_booking_id  on public.status_logs(booking_id);


-- ===========================================================================
-- 4. Row Level Security
-- ===========================================================================
-- Current policies are intentionally permissive (anon can read all bookings,
-- read all drivers, insert bookings, insert status_logs). This is FINE for
-- pre-revenue operation and will be tightened in a later migration once
-- server-side writes move to the service-role client (which bypasses RLS).

alter table public.bookings    enable row level security;
alter table public.drivers     enable row level security;
alter table public.status_logs enable row level security;


-- ===========================================================================
-- 5. RLS policies
-- ===========================================================================
-- Written as drop+create so re-running this migration never errors.
-- Policies mirror what exists in prod as of 2026-10-04.

-- bookings
drop policy if exists "Allow anonymous bookings" on public.bookings;
create policy "Allow anonymous bookings"
  on public.bookings
  for insert
  to anon
  with check (true);

drop policy if exists "Allow reading own bookings" on public.bookings;
create policy "Allow reading own bookings"
  on public.bookings
  for select
  to anon
  using (true);
  -- TODO(Step 5): restrict to owner once auth-derived identity exists on bookings.

-- drivers
drop policy if exists "Allow reading drivers" on public.drivers;
create policy "Allow reading drivers"
  on public.drivers
  for select
  to anon
  using (true);

-- status_logs
drop policy if exists "Allow reading status logs" on public.status_logs;
create policy "Allow reading status logs"
  on public.status_logs
  for select
  to anon
  using (true);

drop policy if exists "Allow status log inserts" on public.status_logs;
create policy "Allow status log inserts"
  on public.status_logs
  for insert
  to anon
  with check (true);


-- ===========================================================================
-- 6. updated_at automation for bookings
-- ===========================================================================
-- Reuses the existing public.update_updated_at() trigger function.
-- After this, application code no longer needs to set updated_at manually
-- on UPDATE statements (a follow-up commit will remove those sets).

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at
  before update on public.bookings
  for each row
  execute function public.update_updated_at();


-- ===========================================================================
-- 7. Deprecated: _legacy_rides
-- ===========================================================================
-- Renamed from `rides` on 2026-10-04. Preserved for reference. No writes.
-- Will be dropped in a future migration once the analytics code confirms
-- it doesn't read from it.
