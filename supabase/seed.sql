-- ============================================
-- TRENDY SISTERS - SEED DATA (STORAGE INTEGRATED)
-- All images reference public Supabase Storage buckets
-- ============================================

-- CATEGORIES
INSERT INTO categories (name, slug, description, image_url, is_active, display_order) VALUES
('Silk Sarees', 'silk-sarees', 'Luxurious pure silk sarees for every occasion', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/silk-sarees.jpg', TRUE, 1),
('Cotton Sarees', 'cotton-sarees', 'Breathable everyday cotton sarees', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/cotton-sarees.jpg', TRUE, 2),
('Designer Sarees', 'designer-sarees', 'Exclusive designer collections from top artisans', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/designer-sarees.jpg', TRUE, 3),
('Banarasi Sarees', 'banarasi-sarees', 'Traditional Banarasi silk with gold zari work', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/banarasi-sarees.jpg', TRUE, 4),
('Party Wear', 'party-wear', 'Glamorous sarees for parties and celebrations', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/party-wear.jpg', TRUE, 5),
('Wedding Sarees', 'wedding-sarees', 'Bridal and wedding collection sarees', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/wedding-sarees.jpg', TRUE, 6),
('Printed Sarees', 'printed-sarees', 'Vibrant printed sarees for casual and festive wear', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/printed-sarees.jpg', TRUE, 7),
('Festive Collection', 'festive-collection', 'Celebrate every festival in style', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/festive-collection.jpg', TRUE, 8)
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url;

-- COLLECTIONS
INSERT INTO collections (name, slug, description, image_url, is_active, display_order) VALUES
('The Wedding Edit', 'wedding-edit', 'Timeless bridal and wedding sarees', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/collections/wedding-edit.jpg', TRUE, 1),
('Festive Luxe', 'festive-luxe', 'Premium festive sarees for Diwali, Navratri and more', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/collections/festive-luxe.jpg', TRUE, 2),
('Summer Pastels', 'summer-pastels', 'Light pastel-toned cotton sarees for summer', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/collections/summer-pastels.jpg', TRUE, 3),
('Heritage Weaves', 'heritage-weaves', 'Handloom sarees from master weavers across India', 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/category-images/collections/heritage-weaves.jpg', TRUE, 4)
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url;

-- PRODUCTS
-- 1. Kanjivaram Silk
INSERT INTO products (name, slug, short_description, description, sku, price, mrp, discount, fabric, color, occasion, stock, is_new, is_bestseller, is_featured, is_active)
SELECT
  'Kanjivaram Silk Saree - Royal Magenta',
  'kanjivaram-silk-saree-royal-magenta',
  'Pure Kanjivaram silk with gold zari border',
  'Exquisite Kanjivaram silk saree in royal magenta with traditional gold zari border. Hand-woven by master craftsmen from Tamil Nadu. Perfect for weddings and festive celebrations.',
  'TS-SILK-001',
  8999, 12999, 31,
  'Pure Silk', 'Magenta', 'Wedding',
  25, TRUE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'TS-SILK-001');

-- 2. Banarasi Silk
INSERT INTO products (name, slug, short_description, description, sku, price, mrp, discount, fabric, color, occasion, stock, is_new, is_bestseller, is_featured, is_active)
SELECT
  'Banarasi Silk Saree - Midnight Blue',
  'banarasi-silk-saree-midnight-blue',
  'Traditional Banarasi with silver zari',
  'Stunning Banarasi silk saree in midnight blue with intricate silver zari weaving. Each saree takes 15 days to weave by skilled Banaras artisans.',
  'TS-BAN-001',
  7499, 9999, 25,
  'Banarasi Silk', 'Midnight Blue', 'Festive',
  18, TRUE, TRUE, FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'TS-BAN-001');

-- 3. Sambalpuri Silk
INSERT INTO products (name, slug, short_description, description, sku, price, mrp, discount, fabric, color, occasion, stock, is_new, is_bestseller, is_featured, is_active)
SELECT
  'Sambalpuri Silk Saree - Terracotta',
  'sambalpuri-silk-saree-terracotta',
  'Authentic Sambalpuri ikat weave',
  'Authentic Sambalpuri silk saree with traditional ikat patterns in warm terracotta tones. Each piece is uniquely hand-crafted by Odisha weavers.',
  'TS-SAM-001',
  4999, 6999, 29,
  'Sambalpuri Silk', 'Terracotta', 'Casual',
  30, FALSE, TRUE, FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'TS-SAM-001');

-- 4. Cotton Saree
INSERT INTO products (name, slug, short_description, description, sku, price, mrp, discount, fabric, color, occasion, stock, is_new, is_bestseller, is_featured, is_active)
SELECT
  'Pure Cotton Saree - Pastel Pink',
  'pure-cotton-saree-pastel-pink',
  'Lightweight cotton for everyday elegance',
  'Soft pure cotton saree in delicate pastel pink. Perfect for office wear and casual occasions. Comes with matching blouse piece.',
  'TS-COT-001',
  1299, 1999, 35,
  'Pure Cotton', 'Pastel Pink', 'Office',
  50, TRUE, FALSE, FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'TS-COT-001');

-- 5. Designer Georgette
INSERT INTO products (name, slug, short_description, description, sku, price, mrp, discount, fabric, color, occasion, stock, is_new, is_bestseller, is_featured, is_active)
SELECT
  'Designer Georgette Saree - Wine Red',
  'designer-georgette-saree-wine-red',
  'Embroidered georgette for parties',
  'Stunning designer georgette saree in wine red with heavy embroidery work. The flowing georgette fabric drapes beautifully for parties and receptions.',
  'TS-DES-001',
  3499, 4999, 30,
  'Georgette', 'Wine Red', 'Party',
  20, TRUE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'TS-DES-001');

-- 6. Linen Cotton
INSERT INTO products (name, slug, short_description, description, sku, price, mrp, discount, fabric, color, occasion, stock, is_new, is_bestseller, is_featured, is_active)
SELECT
  'Linen Cotton Saree - Sage Green',
  'linen-cotton-saree-sage-green',
  'Sustainable linen for the modern woman',
  'Eco-friendly linen cotton blend in calming sage green. Lightweight, breathable and perfect for everyday wear. A wardrobe essential for the modern woman.',
  'TS-LIN-001',
  2199, 2999, 27,
  'Linen Cotton', 'Sage Green', 'Casual',
  40, TRUE, FALSE, FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'TS-LIN-001');

-- 7. Chanderi Silk
INSERT INTO products (name, slug, short_description, description, sku, price, mrp, discount, fabric, color, occasion, stock, is_new, is_bestseller, is_featured, is_active)
SELECT
  'Chanderi Silk Saree - Golden Yellow',
  'chanderi-silk-saree-golden-yellow',
  'Traditional Chanderi with gold motifs',
  'Elegant Chanderi silk saree with traditional gold buti work in vibrant golden yellow. Chanderi is known for its lightweight sheer texture and shimmering appearance.',
  'TS-CHA-001',
  5499, 7499, 27,
  'Chanderi Silk', 'Golden Yellow', 'Festive',
  15, FALSE, TRUE, FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'TS-CHA-001');

-- 8. Bridal Kanjivaram
INSERT INTO products (name, slug, short_description, description, sku, price, mrp, discount, fabric, color, occasion, stock, is_new, is_bestseller, is_featured, is_active)
SELECT
  'Bridal Kanjivaram - Deep Maroon',
  'bridal-kanjivaram-deep-maroon',
  'Premium bridal silk with rich pallu',
  'The ultimate bridal saree in deep maroon Kanjivaram silk with a heavily embroidered gold pallu. A timeless piece for your special day.',
  'TS-BRD-001',
  15999, 22999, 30,
  'Kanjivaram Silk', 'Deep Maroon', 'Wedding',
  10, TRUE, FALSE, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'TS-BRD-001');

-- BANNERS
INSERT INTO banners (title, subtitle, image_url, link_url, is_active, display_order) VALUES
(
  'Elegance in Every Drape',
  'Discover timeless sarees crafted for modern celebrations.',
  'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/banner-images/banner-elegance.jpg',
  '/shop',
  TRUE, 1
),
(
  'The Wedding Edit 2024',
  'Celebrate your special moments in timeless elegance.',
  'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/banner-images/banner-wedding.jpg',
  '/collections/wedding-edit',
  TRUE, 2
),
(
  'New Arrivals — Festive Luxe',
  'Explore our newest festive saree collection.',
  'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/banner-images/banner-festive.jpg',
  '/collections/festive-luxe',
  TRUE, 3
)
ON CONFLICT DO NOTHING;

-- PRODUCT IMAGES (using live Supabase Storage URLs)
DO $$
DECLARE
  p_id UUID;
BEGIN
  -- Kanjivaram
  SELECT id INTO p_id FROM products WHERE sku = 'TS-SILK-001';
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/kanjivaram-magenta-1.jpg', 0, TRUE),
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/kanjivaram-magenta-2.jpg', 1, FALSE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Banarasi
  SELECT id INTO p_id FROM products WHERE sku = 'TS-BAN-001';
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/banarasi-blue-1.jpg', 0, TRUE),
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/banarasi-blue-2.jpg', 1, FALSE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Sambalpuri
  SELECT id INTO p_id FROM products WHERE sku = 'TS-SAM-001';
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/sambalpuri-terracotta-1.jpg', 0, TRUE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Cotton
  SELECT id INTO p_id FROM products WHERE sku = 'TS-COT-001';
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/cotton-pastel-pink-1.jpg', 0, TRUE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Designer
  SELECT id INTO p_id FROM products WHERE sku = 'TS-DES-001';
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/designer-wine-red-1.jpg', 0, TRUE),
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/designer-wine-red-2.jpg', 1, FALSE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Linen
  SELECT id INTO p_id FROM products WHERE sku = 'TS-LIN-001';
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/linen-sage-green-1.jpg', 0, TRUE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Chanderi
  SELECT id INTO p_id FROM products WHERE sku = 'TS-CHA-001';
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/chanderi-golden-yellow-1.jpg', 0, TRUE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Bridal
  SELECT id INTO p_id FROM products WHERE sku = 'TS-BRD-001';
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/bridal-deep-maroon-1.jpg', 0, TRUE),
    (p_id, 'https://efirqiluvuerurnpptfm.supabase.co/storage/v1/object/public/product-images/bridal-deep-maroon-2.jpg', 1, FALSE)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
