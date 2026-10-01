-- ==============================================================================
-- TRENDY SISTERS - FIX PROFILES TABLE FOR CLERK USER IDS
-- Recreates the profiles table with id as TEXT (instead of UUID)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/efirqiluvuerurnpptfm/sql
-- ==============================================================================

DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_profiles" ON profiles;
CREATE POLICY "allow_all_profiles" ON profiles FOR ALL USING (TRUE) WITH CHECK (TRUE);
