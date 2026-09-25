-- ==============================================================================
-- FIX BROKEN IMAGE URLS IN SUPABASE
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- to repair any records containing deleted Unsplash photo IDs.
-- ==============================================================================

-- 1. Fix Product Images
UPDATE product_images 
SET image_url = REPLACE(image_url, 'photo-1632932673729-06cf7e47048c', 'photo-1617627143750-d86bc21e42bb')
WHERE image_url LIKE '%photo-1632932673729-06cf7e47048c%';

UPDATE product_images 
SET image_url = REPLACE(image_url, 'photo-1614886137568-36d0e2e07e27', 'photo-1679006831648-7c9ea12e5807')
WHERE image_url LIKE '%photo-1614886137568-36d0e2e07e27%';

-- 2. Fix Categories
UPDATE categories 
SET image_url = REPLACE(image_url, 'photo-1632932673729-06cf7e47048c', 'photo-1617627143750-d86bc21e42bb')
WHERE image_url LIKE '%photo-1632932673729-06cf7e47048c%';

UPDATE categories 
SET image_url = REPLACE(image_url, 'photo-1614886137568-36d0e2e07e27', 'photo-1679006831648-7c9ea12e5807')
WHERE image_url LIKE '%photo-1614886137568-36d0e2e07e27%';

-- 3. Fix Banners
UPDATE banners 
SET image_url = REPLACE(image_url, 'photo-1632932673729-06cf7e47048c', 'photo-1617627143750-d86bc21e42bb')
WHERE image_url LIKE '%photo-1632932673729-06cf7e47048c%';

UPDATE banners 
SET image_url = REPLACE(image_url, 'photo-1614886137568-36d0e2e07e27', 'photo-1679006831648-7c9ea12e5807')
WHERE image_url LIKE '%photo-1614886137568-36d0e2e07e27%';

-- 4. Fix Collections
UPDATE collections 
SET image_url = REPLACE(image_url, 'photo-1632932673729-06cf7e47048c', 'photo-1617627143750-d86bc21e42bb')
WHERE image_url LIKE '%photo-1632932673729-06cf7e47048c%';

UPDATE collections 
SET image_url = REPLACE(image_url, 'photo-1614886137568-36d0e2e07e27', 'photo-1679006831648-7c9ea12e5807')
WHERE image_url LIKE '%photo-1614886137568-36d0e2e07e27%';
