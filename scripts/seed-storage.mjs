/**
 * seed-storage.mjs
 * ============================================================
 * Trendy Sisters — Seed & Push Images into Supabase Storage
 *
 * Downloads curated authentic saree images and uploads them
 * into the respective Supabase Storage buckets:
 *   - category-images
 *   - banner-images
 *   - product-images
 * ============================================================
 */

import { createClient } from "@supabase/supabase-js"
import fetch from "node-fetch"
import { readFileSync, writeFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, "..", ".env.local")

function loadEnv(filePath) {
  try {
    const lines = readFileSync(filePath, "utf8").split("\n")
    for (const line of lines) {
      const [key, ...rest] = line.split("=")
      if (key && rest.length) {
        process.env[key.trim()] = rest.join("=").trim()
      }
    }
  } catch {
    console.warn("Could not read .env.local — using process.env")
  }
}
loadEnv(envPath)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
const API_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !API_KEY) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, API_KEY, {
  auth: { persistSession: false },
})

const CATEGORY_ITEMS = [
  { slug: "silk-sarees", file: "silk-sarees.jpg", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=85" },
  { slug: "cotton-sarees", file: "cotton-sarees.jpg", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&q=85" },
  { slug: "designer-sarees", file: "designer-sarees.jpg", url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&q=85" },
  { slug: "banarasi-sarees", file: "banarasi-sarees.jpg", url: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?w=1000&q=85" },
  { slug: "party-wear", file: "party-wear.jpg", url: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=1000&q=85" },
  { slug: "wedding-sarees", file: "wedding-sarees.jpg", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=85" },
  { slug: "printed-sarees", file: "printed-sarees.jpg", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&q=85" },
  { slug: "festive-collection", file: "festive-collection.jpg", url: "https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?w=1000&q=85" },
]

const COLLECTION_ITEMS = [
  { slug: "wedding-edit", file: "collections/wedding-edit.jpg", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=85" },
  { slug: "festive-luxe", file: "collections/festive-luxe.jpg", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&q=85" },
  { slug: "summer-pastels", file: "collections/summer-pastels.jpg", url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&q=85" },
  { slug: "heritage-weaves", file: "collections/heritage-weaves.jpg", url: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?w=1000&q=85" },
]

const BANNER_ITEMS = [
  { order: 1, file: "banner-elegance.jpg", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&h=700&fit=crop&q=85" },
  { order: 2, file: "banner-wedding.jpg", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&h=700&fit=crop&q=85" },
  { order: 3, file: "banner-festive.jpg", url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&h=700&fit=crop&q=85" },
]

const PRODUCT_ITEMS = [
  { sku: "TS-SILK-001", images: [
    { sort: 0, file: "kanjivaram-magenta-1.jpg", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=1100&fit=crop&q=85" },
    { sort: 1, file: "kanjivaram-magenta-2.jpg", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&h=1100&fit=crop&q=85" },
  ]},
  { sku: "TS-BAN-001", images: [
    { sort: 0, file: "banarasi-blue-1.jpg", url: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?w=900&h=1100&fit=crop&q=85" },
    { sort: 1, file: "banarasi-blue-2.jpg", url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&h=1100&fit=crop&q=85" },
  ]},
  { sku: "TS-SAM-001", images: [
    { sort: 0, file: "sambalpuri-terracotta-1.jpg", url: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=900&h=1100&fit=crop&q=85" },
  ]},
  { sku: "TS-COT-001", images: [
    { sort: 0, file: "cotton-pastel-pink-1.jpg", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&h=1100&fit=crop&q=85" },
  ]},
  { sku: "TS-DES-001", images: [
    { sort: 0, file: "designer-wine-red-1.jpg", url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&h=1100&fit=crop&q=85" },
    { sort: 1, file: "designer-wine-red-2.jpg", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=1100&fit=crop&q=85" },
  ]},
  { sku: "TS-LIN-001", images: [
    { sort: 0, file: "linen-sage-green-1.jpg", url: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?w=900&h=1100&fit=crop&q=85" },
  ]},
  { sku: "TS-CHA-001", images: [
    { sort: 0, file: "chanderi-golden-yellow-1.jpg", url: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=900&h=1100&fit=crop&q=85" },
  ]},
  { sku: "TS-BRD-001", images: [
    { sort: 0, file: "bridal-deep-maroon-1.jpg", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=1100&fit=crop&q=85" },
    { sort: 1, file: "bridal-deep-maroon-2.jpg", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&h=1100&fit=crop&q=85" },
  ]},
]

async function download(url) {
  const resp = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    redirect: "follow",
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`)
  const arrayBuffer = await resp.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return { buffer, contentType: resp.headers.get("content-type") || "image/jpeg" }
}

async function uploadFile(bucket, filePath, url) {
  process.stdout.write(`  [${bucket}] ${filePath} ... `)
  const { buffer, contentType } = await download(url)
  const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
    contentType,
    upsert: true,
  })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  console.log(`✅ Uploaded (${Math.round(buffer.length / 1024)} KB)`)
  return data.publicUrl
}

async function main() {
  console.log("==================================================")
  console.log("TRENDY SISTERS — UPLOADING IMAGES TO STORAGE")
  console.log("Supabase Project:", SUPABASE_URL)
  console.log("==================================================\n")

  const uploadedUrls = {
    categories: {},
    collections: {},
    banners: {},
    products: {},
  }

  // 1. Categories
  console.log("1. Seeding Category Images...")
  for (const item of CATEGORY_ITEMS) {
    try {
      const publicUrl = await uploadFile("category-images", item.file, item.url)
      uploadedUrls.categories[item.slug] = publicUrl
    } catch (e) {
      console.error(`❌ Failed:`, e.message || e)
    }
  }

  // 2. Collections
  console.log("\n2. Seeding Collection Images...")
  for (const item of COLLECTION_ITEMS) {
    try {
      const publicUrl = await uploadFile("category-images", item.file, item.url)
      uploadedUrls.collections[item.slug] = publicUrl
    } catch (e) {
      console.error(`❌ Failed:`, e.message || e)
    }
  }

  // 3. Banners
  console.log("\n3. Seeding Banner Images...")
  for (const item of BANNER_ITEMS) {
    try {
      const publicUrl = await uploadFile("banner-images", item.file, item.url)
      uploadedUrls.banners[item.order] = publicUrl
    } catch (e) {
      console.error(`❌ Failed:`, e.message || e)
    }
  }

  // 4. Products
  console.log("\n4. Seeding Product Images...")
  for (const prod of PRODUCT_ITEMS) {
    uploadedUrls.products[prod.sku] = []
    for (const img of prod.images) {
      try {
        const publicUrl = await uploadFile("product-images", img.file, img.url)
        uploadedUrls.products[prod.sku].push({ sort: img.sort, url: publicUrl })
      } catch (e) {
        console.error(`❌ Failed:`, e.message || e)
      }
    }
  }

  console.log("\n==================================================")
  console.log("GENERATING SQL UPDATE SCRIPT...")
  console.log("==================================================")

  // Generate SQL update statements
  let sql = `-- ==============================================================================
-- TRENDY SISTERS — UPDATE DATABASE IMAGE URLS WITH LIVE STORAGE URLS
-- Run this script in Supabase SQL Editor to connect all tables to storage images!
-- ==============================================================================

`

  // Categories
  sql += `-- 1. Update Categories\n`
  for (const [slug, url] of Object.entries(uploadedUrls.categories)) {
    sql += `UPDATE categories SET image_url = '${url}' WHERE slug = '${slug}';\n`
  }

  // Collections
  sql += `\n-- 2. Update Collections\n`
  for (const [slug, url] of Object.entries(uploadedUrls.collections)) {
    sql += `UPDATE collections SET image_url = '${url}' WHERE slug = '${slug}';\n`
  }

  // Banners
  sql += `\n-- 3. Update Banners\n`
  for (const [order, url] of Object.entries(uploadedUrls.banners)) {
    sql += `UPDATE banners SET image_url = '${url}' WHERE display_order = ${order};\n`
  }

  // Products
  sql += `\n-- 4. Update Product Images\nDO $$\nDECLARE\n  p_id UUID;\nBEGIN\n`
  for (const [sku, images] of Object.entries(uploadedUrls.products)) {
    sql += `  SELECT id INTO p_id FROM products WHERE sku = '${sku}';\n  IF p_id IS NOT NULL THEN\n`
    for (const img of images) {
      sql += `    IF EXISTS (SELECT 1 FROM product_images WHERE product_id = p_id AND sort_order = ${img.sort}) THEN\n`
      sql += `      UPDATE product_images SET image_url = '${img.url}' WHERE product_id = p_id AND sort_order = ${img.sort};\n`
      sql += `    ELSE\n`
      sql += `      INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (p_id, '${img.url}', ${img.sort}, ${img.sort === 0});\n`
      sql += `    END IF;\n`
    }
    sql += `  END IF;\n\n`
  }
  sql += `END $$;\n`

  const sqlPath = path.join(__dirname, "..", "supabase", "update-storage-urls.sql")
  writeFileSync(sqlPath, sql, "utf8")
  console.log(`Saved SQL to: ${sqlPath}`)

  console.log("\n==================================================")
  console.log("STORAGE SEED COMPLETED SUCCESSFULLY!")
  console.log("==================================================")
}

main().catch(console.error)
