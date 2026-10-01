-- ==============================================================================
-- TRENDY SISTERS - CLERK AUTHENTICATION COMPATIBILITY MIGRATION
-- Adjusts tables to support Clerk User IDs (string/text like 'user_xxx')
-- instead of Supabase Auth UUIDs (which cause HTTP 400 Bad Request errors).
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/efirqlluvuerurnpptfm/sql
-- ==============================================================================

-- 1. PROFILES TABLE
-- Drop foreign key to auth.users and change id to TEXT
DO $$
BEGIN
  -- Drop constraint if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;

  -- Change column type to TEXT
  ALTER TABLE profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Profiles alteration note: %', SQLERRM;
END $$;

-- Enable RLS and grant full CRUD access on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "allow_all_profiles" ON profiles FOR ALL USING (TRUE) WITH CHECK (TRUE);


-- 2. ADDRESSES TABLE
-- Change user_id to TEXT and drop auth.users foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'addresses_user_id_fkey' AND table_name = 'addresses'
  ) THEN
    ALTER TABLE addresses DROP CONSTRAINT addresses_user_id_fkey;
  END IF;

  ALTER TABLE addresses ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Addresses alteration note: %', SQLERRM;
END $$;

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
CREATE POLICY "allow_all_addresses" ON addresses FOR ALL USING (TRUE) WITH CHECK (TRUE);


-- 3. ORDERS TABLE
-- Change user_id to TEXT and drop auth.users foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_user_id_fkey' AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
  END IF;

  ALTER TABLE orders ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Orders alteration note: %', SQLERRM;
END $$;


-- 4. WISHLISTS TABLE
-- Change user_id to TEXT and drop auth.users foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'wishlists_user_id_fkey' AND table_name = 'wishlists'
  ) THEN
    ALTER TABLE wishlists DROP CONSTRAINT wishlists_user_id_fkey;
  END IF;

  ALTER TABLE wishlists ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Wishlists alteration note: %', SQLERRM;
END $$;

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_wishlists" ON wishlists;
CREATE POLICY "allow_all_wishlists" ON wishlists FOR ALL USING (TRUE) WITH CHECK (TRUE);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_wishlist_items" ON wishlist_items;
CREATE POLICY "allow_all_wishlist_items" ON wishlist_items FOR ALL USING (TRUE) WITH CHECK (TRUE);


-- 5. CARTS TABLE
-- Change user_id to TEXT and drop auth.users foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'carts_user_id_fkey' AND table_name = 'carts'
  ) THEN
    ALTER TABLE carts DROP CONSTRAINT carts_user_id_fkey;
  END IF;

  ALTER TABLE carts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Carts alteration note: %', SQLERRM;
END $$;

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_carts" ON carts;
CREATE POLICY "allow_all_carts" ON carts FOR ALL USING (TRUE) WITH CHECK (TRUE);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_cart_items" ON cart_items;
CREATE POLICY "allow_all_cart_items" ON cart_items FOR ALL USING (TRUE) WITH CHECK (TRUE);


-- 6. REVIEWS TABLE (if present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_user_id_fkey' AND table_name = 'reviews'
  ) THEN
    ALTER TABLE reviews DROP CONSTRAINT reviews_user_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE reviews ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Reviews alteration note: %', SQLERRM;
END $$;
