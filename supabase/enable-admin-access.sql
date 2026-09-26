-- ==============================================================================
-- TRENDY SISTERS - ENABLE FULL CRUD & ADMIN ACCESS IN SUPABASE
-- Safe & Idempotent Script: Cleans up existing policies and creates fresh full-access policies
-- ==============================================================================

-- Step 1: Drop ALL existing policies on catalog and admin tables to prevent name collision errors
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('products', 'product_images', 'categories', 'collections', 'banners', 'orders', 'order_items')
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Step 2: Enable RLS and create clean universal access policies for each table

-- 1. PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_products" ON products FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 2. PRODUCT IMAGES
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_product_images" ON product_images FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 3. CATEGORIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_categories" ON categories FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 4. COLLECTIONS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_collections" ON collections FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 5. BANNERS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_banners" ON banners FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 6. ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_orders" ON orders FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 7. ORDER ITEMS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_order_items" ON order_items FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Step 3: Storage bucket setup for image uploads (product-images, category-images, banner-images)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Allow public read, upload, update, delete for all storage buckets
CREATE POLICY "allow_public_storage_select" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "allow_public_storage_insert" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_public_storage_update" ON storage.objects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_public_storage_delete" ON storage.objects FOR DELETE USING (true);
