-- ==============================================================================
-- TRENDY SISTERS - SUPABASE STORAGE SETUP & RLS POLICIES
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CREATE PUBLIC STORAGE BUCKETS
-- ------------------------------------------------------------------------------

-- Product images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  TRUE,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Category images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  TRUE,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Banner images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banner-images',
  'banner-images',
  TRUE,
  20971520, -- 20 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- User avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];


-- ------------------------------------------------------------------------------
-- 2. STORAGE POLICIES: product-images
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public insert product images" ON storage.objects;
CREATE POLICY "Public insert product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public update product images" ON storage.objects;
CREATE POLICY "Public update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public delete product images" ON storage.objects;
CREATE POLICY "Public delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');


-- ------------------------------------------------------------------------------
-- 3. STORAGE POLICIES: category-images
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read category images" ON storage.objects;
CREATE POLICY "Public read category images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Public insert category images" ON storage.objects;
CREATE POLICY "Public insert category images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Public update category images" ON storage.objects;
CREATE POLICY "Public update category images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Public delete category images" ON storage.objects;
CREATE POLICY "Public delete category images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'category-images');


-- ------------------------------------------------------------------------------
-- 4. STORAGE POLICIES: banner-images
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read banner images" ON storage.objects;
CREATE POLICY "Public read banner images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banner-images');

DROP POLICY IF EXISTS "Public insert banner images" ON storage.objects;
CREATE POLICY "Public insert banner images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banner-images');

DROP POLICY IF EXISTS "Public update banner images" ON storage.objects;
CREATE POLICY "Public update banner images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'banner-images');

DROP POLICY IF EXISTS "Public delete banner images" ON storage.objects;
CREATE POLICY "Public delete banner images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'banner-images');


-- ------------------------------------------------------------------------------
-- 5. STORAGE POLICIES: avatars
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
