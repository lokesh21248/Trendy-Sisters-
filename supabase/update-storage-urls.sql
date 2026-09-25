-- ==============================================================================
-- TRENDY SISTERS — UPDATE DATABASE IMAGE URLS WITH LIVE STORAGE URLS
-- Run this script in Supabase SQL Editor to connect all tables to storage images!
-- ==============================================================================

-- 1. Update Categories
UPDATE categories SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/silk-sarees.jpg' WHERE slug = 'silk-sarees';
UPDATE categories SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/cotton-sarees.jpg' WHERE slug = 'cotton-sarees';
UPDATE categories SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/designer-sarees.jpg' WHERE slug = 'designer-sarees';
UPDATE categories SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/banarasi-sarees.jpg' WHERE slug = 'banarasi-sarees';
UPDATE categories SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/party-wear.jpg' WHERE slug = 'party-wear';
UPDATE categories SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/wedding-sarees.jpg' WHERE slug = 'wedding-sarees';
UPDATE categories SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/printed-sarees.jpg' WHERE slug = 'printed-sarees';
UPDATE categories SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/festive-collection.jpg' WHERE slug = 'festive-collection';

-- 2. Update Collections
UPDATE collections SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/collections/wedding-edit.jpg' WHERE slug = 'wedding-edit';
UPDATE collections SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/collections/festive-luxe.jpg' WHERE slug = 'festive-luxe';
UPDATE collections SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/collections/summer-pastels.jpg' WHERE slug = 'summer-pastels';
UPDATE collections SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/collections/heritage-weaves.jpg' WHERE slug = 'heritage-weaves';

-- 3. Update Banners
UPDATE banners SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/banner-images/banner-elegance.jpg' WHERE display_order = 1;
UPDATE banners SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/banner-images/banner-wedding.jpg' WHERE display_order = 2;
UPDATE banners SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/banner-images/banner-festive.jpg' WHERE display_order = 3;

-- 4. Update Product Images
DO $$
DECLARE
  p_id UUID;
BEGIN
  SELECT id INTO p_id FROM products WHERE sku = 'TS-SILK-001';
  IF p_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 0) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/kanjivaram-magenta-1.jpg' WHERE product_id = p_id AND sort_order = 0;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/kanjivaram-magenta-1.jpg', 0, true);
    END IF;
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 1) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/kanjivaram-magenta-2.jpg' WHERE product_id = p_id AND sort_order = 1;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/kanjivaram-magenta-2.jpg', 1, false);
    END IF;
  END IF;

  SELECT id INTO p_id FROM products WHERE sku = 'TS-BAN-001';
  IF p_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 0) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/banarasi-blue-1.jpg' WHERE product_id = p_id AND sort_order = 0;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/banarasi-blue-1.jpg', 0, true);
    END IF;
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 1) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/banarasi-blue-2.jpg' WHERE product_id = p_id AND sort_order = 1;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/banarasi-blue-2.jpg', 1, false);
    END IF;
  END IF;

  SELECT id INTO p_id FROM products WHERE sku = 'TS-SAM-001';
  IF p_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 0) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/sambalpuri-terracotta-1.jpg' WHERE product_id = p_id AND sort_order = 0;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/sambalpuri-terracotta-1.jpg', 0, true);
    END IF;
  END IF;

  SELECT id INTO p_id FROM products WHERE sku = 'TS-COT-001';
  IF p_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 0) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/cotton-pastel-pink-1.jpg' WHERE product_id = p_id AND sort_order = 0;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/cotton-pastel-pink-1.jpg', 0, true);
    END IF;
  END IF;

  SELECT id INTO p_id FROM products WHERE sku = 'TS-DES-001';
  IF p_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 0) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/designer-wine-red-1.jpg' WHERE product_id = p_id AND sort_order = 0;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/designer-wine-red-1.jpg', 0, true);
    END IF;
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 1) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/designer-wine-red-2.jpg' WHERE product_id = p_id AND sort_order = 1;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/designer-wine-red-2.jpg', 1, false);
    END IF;
  END IF;

  SELECT id INTO p_id FROM products WHERE sku = 'TS-LIN-001';
  IF p_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 0) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/linen-sage-green-1.jpg' WHERE product_id = p_id AND sort_order = 0;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/linen-sage-green-1.jpg', 0, true);
    END IF;
  END IF;

  SELECT id INTO p_id FROM products WHERE sku = 'TS-CHA-001';
  IF p_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 0) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/chanderi-golden-yellow-1.jpg' WHERE product_id = p_id AND sort_order = 0;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/chanderi-golden-yellow-1.jpg', 0, true);
    END IF;
  END IF;

  SELECT id INTO p_id FROM products WHERE sku = 'TS-BRD-001';
  IF p_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 0) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/bridal-deep-maroon-1.jpg' WHERE product_id = p_id AND sort_order = 0;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/bridal-deep-maroon-1.jpg', 0, true);
    END IF;
    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = 1) THEN
      UPDATE product_images SET image_url = 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/bridal-deep-maroon-2.jpg' WHERE product_id = p_id AND sort_order = 1;
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/bridal-deep-maroon-2.jpg', 1, false);
    END IF;
  END IF;

END $$;
