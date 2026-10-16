/*
# TalentBridge — Profiles and Events tables

## What this migration does

Creates the core database schema for TalentBridge, a platform connecting local
artists with event organizers. Two tables are created: `profiles` (extends
Supabase auth.users with role and display info) and `events` (event listings
posted by organizers that talents can browse and apply to).

## New Tables

### 1. `profiles`
- `id` (uuid, primary key, references auth.users) — one row per user
- `full_name` (text) — display name
- `role` (text) — 'talent' or 'organizer'
- `city` (text) — user's city
- `phone` (text) — contact number
- `talent_category` (text, nullable) — only for talents (e.g. 'Music', 'Dance')
- `organization_name` (text, nullable) — only for organizers
- `created_at` (timestamptz)

### 2. `events`
- `id` (uuid, primary key)
- `title` (text) — event name
- `description` (text) — short description
- `organizer_name` (text) — name of organizer
- `organizer_id` (uuid, references profiles) — who posted it
- `date` (date) — event date
- `time` (text) — event time
- `venue` (text) — venue name
- `city` (text) — city
- `budget` (text) — budget range string
- `talent_category` (text) — required talent type
- `available_slots` (integer) — number of open slots
- `poster_url` (text, nullable) — optional poster image
- `created_at` (timestamptz)

## Security
- RLS enabled on both tables.
- `profiles`: users can read all profiles (public directory), but only update
  their own. Only authenticated users can insert (on signup).
- `events`: anyone can read (browse events); only the organizer who created an
  event can update or delete it. Any authenticated user can create events.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'talent' CHECK (role IN ('talent', 'organizer')),
  city text,
  phone text,
  talent_category text,
  organization_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  organizer_name text NOT NULL,
  organizer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  date date NOT NULL,
  time text NOT NULL DEFAULT '',
  venue text NOT NULL,
  city text NOT NULL,
  budget text NOT NULL DEFAULT '',
  talent_category text NOT NULL,
  available_slots integer NOT NULL DEFAULT 1,
  poster_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_all" ON events;
CREATE POLICY "events_select_all"
ON events FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "events_insert_own" ON events;
CREATE POLICY "events_insert_own"
ON events FOR INSERT
TO authenticated WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "events_update_own" ON events;
CREATE POLICY "events_update_own"
ON events FOR UPDATE
TO authenticated USING (auth.uid() = organizer_id) WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "events_delete_own" ON events;
CREATE POLICY "events_delete_own"
ON events FOR DELETE
TO authenticated USING (auth.uid() = organizer_id);

CREATE INDEX IF NOT EXISTS idx_events_city ON events (city);
CREATE INDEX IF NOT EXISTS idx_events_category ON events (talent_category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (date);
