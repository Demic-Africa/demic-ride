-- Add scheduled date/time and notes to bookings.
-- The form collected these but the table had no columns to store them.
-- This migration fixes that data loss bug.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS scheduled_date date,
  ADD COLUMN IF NOT EXISTS scheduled_time time,
  ADD COLUMN IF NOT EXISTS notes text;
