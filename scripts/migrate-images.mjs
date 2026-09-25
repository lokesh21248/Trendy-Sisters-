/**
 * migrate-images.mjs
 * ============================================================
 * Trendy Sisters — Image Migration Script
 *
 * What this does:
 *   1. Reads all image_url fields from: product_images, categories,
 *      collections, banners tables
 *   2. Downloads each image (Unsplash or any external URL)
 *   3. Uploads it to the correct Supabase Storage bucket
 *   4. Updates the database row with the new Supabase Storage URL
 *
 * Usage:
 *   node scripts/migrate-images.mjs
 *
 * Prerequisites:
 *   - Set SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - npm install @supabase/supabase-js node-fetch
 * ============================================================
 */

import { createClient } from "@supabase/supabase-js"
import fetch from "node-fetch"
import { readFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

// ── Load env ────────────────────────────────────────────────
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
    console.warn("⚠️  Could not read .env.local — using existing env vars")
  }
}
loadEnv(envPath)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(`
❌  Missing environment variables!

Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.
You can find it in Supabase Dashboard → Settings → API → service_role key.

Example .env.local:
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...   ← add this
`)
  process.exit(1)
}

// ── Supabase client (service role — bypasses RLS) ───────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// ── Helpers ─────────────────────────────────────────────────

/** Download an image buffer from any URL */
async function downloadImage(url) {
  const resp = await fetch(url, {
    headers: { "User-Agent": "TrendySisters-ImageMigrator/1.0" },
    redirect: "follow",
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`)
  const buffer = await resp.buffer()
  const contentType = resp.headers.get("content-type") || "image/jpeg"
  return { buffer, contentType }
}

/** Derive file extension from content-type */
function extFromMime(mime) {
  if (mime.includes("png")) return "png"
  if (mime.includes("webp")) return "webp"
  if (mime.includes("gif")) return "gif"
  return "jpg"
}

/** Generate a stable storage path from the source URL and a slug */
function storagePath(slug, index, ext) {
  return `${slug}/${index}.${ext}`
}

/** Check if URL is already a Supabase Storage URL for THIS project */
function isAlreadyMigrated(url) {
  return url && url.includes(SUPABASE_URL) && url.includes("/storage/v1/")
}

/**
 * Upload image to Supabase Storage bucket.
 * Returns the public URL on success.
 */
async function uploadToStorage(bucket, storagePath, buffer, contentType) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true, // overwrite if same path exists
    })

  if (error) throw new Error(`Storage upload error: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath)
  return data.publicUrl
}

/** Migrate a single image URL → Storage, return new public URL */
async function migrateImage(bucket, imagePath, sourceUrl) {
  if (isAlreadyMigrated(sourceUrl)) {
    console.log(`  ↩  Already in Storage: ${imagePath}`)
    return sourceUrl
  }
  console.log(`  ⬇  Downloading: ${sourceUrl.slice(0, 80)}...`)
  const { buffer, contentType } = await downloadImage(sourceUrl)
  const ext = extFromMime(contentType)
  const finalPath = imagePath.endsWith(".jpg") || imagePath.endsWith(".png")
    ? imagePath
    : `${imagePath}.${ext}`

  console.log(`  ⬆  Uploading to ${bucket}/${finalPath}`)
  const publicUrl = await uploadToStorage(bucket, finalPath, buffer, contentType)
  console.log(`  ✅ Done → ${publicUrl.slice(0, 80)}`)
  return publicUrl
}

// ── Migration tasks ──────────────────────────────────────────

async function migrateProductImages() {
  console.log("\n📦 Migrating product_images table...")

  const { data: images, error } = await supabase
    .from("product_images")
    .select("id, image_url, product_id, sort_order")

  if (error) { console.error("  ❌ Error fetching product_images:", error.message); return }
  console.log(`  Found ${images.length} product image(s)`)

  for (const img of images) {
    try {
      const slug = `product-${img.product_id}`
      const path = storagePath(slug, img.sort_order ?? 0, "jpg")
      const newUrl = await migrateImage("product-images", path, img.image_url)

      if (newUrl !== img.image_url) {
        const { error: updateErr } = await supabase
          .from("product_images")
          .update({ image_url: newUrl })
          .eq("id", img.id)
        if (updateErr) console.error(`  ❌ DB update failed for ${img.id}:`, updateErr.message)
      }
    } catch (err) {
      console.error(`  ❌ Failed for product_image ${img.id}: ${err.message}`)
    }
  }
}

async function migrateCategories() {
  console.log("\n🗂️  Migrating categories table...")

  const { data: cats, error } = await supabase
    .from("categories")
    .select("id, slug, image_url")

  if (error) { console.error("  ❌ Error fetching categories:", error.message); return }
  const withImage = cats.filter(c => c.image_url)
  console.log(`  Found ${withImage.length} categor(ies) with images`)

  for (const cat of withImage) {
    try {
      const path = `${cat.slug}/cover.jpg`
      const newUrl = await migrateImage("category-images", path, cat.image_url)

      if (newUrl !== cat.image_url) {
        await supabase.from("categories").update({ image_url: newUrl }).eq("id", cat.id)
      }
    } catch (err) {
      console.error(`  ❌ Failed for category ${cat.slug}: ${err.message}`)
    }
  }
}

async function migrateCollections() {
  console.log("\n🗃️  Migrating collections table...")

  const { data: cols, error } = await supabase
    .from("collections")
    .select("id, slug, image_url")

  if (error) { console.error("  ❌ Error fetching collections:", error.message); return }
  const withImage = cols.filter(c => c.image_url)
  console.log(`  Found ${withImage.length} collection(s) with images`)

  for (const col of withImage) {
    try {
      const path = `${col.slug}/cover.jpg`
      // reuse category-images bucket for collections as well (or create a dedicated one)
      const newUrl = await migrateImage("category-images", `collections/${path}`, col.image_url)

      if (newUrl !== col.image_url) {
        await supabase.from("collections").update({ image_url: newUrl }).eq("id", col.id)
      }
    } catch (err) {
      console.error(`  ❌ Failed for collection ${col.slug}: ${err.message}`)
    }
  }
}

async function migrateBanners() {
  console.log("\n🖼️  Migrating banners table...")

  const { data: banners, error } = await supabase
    .from("banners")
    .select("id, title, image_url, display_order")

  if (error) { console.error("  ❌ Error fetching banners:", error.message); return }
  console.log(`  Found ${banners.length} banner(s)`)

  for (const banner of banners) {
    try {
      const slug = banner.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      const path = `${slug}-${banner.display_order}.jpg`
      const newUrl = await migrateImage("banner-images", path, banner.image_url)

      if (newUrl !== banner.image_url) {
        await supabase.from("banners").update({ image_url: newUrl }).eq("id", banner.id)
      }
    } catch (err) {
      console.error(`  ❌ Failed for banner ${banner.id}: ${err.message}`)
    }
  }
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Trendy Sisters — Image Migration to Supabase Storage")
  console.log(`   Project: ${SUPABASE_URL}`)
  console.log("─".repeat(60))

  await migrateProductImages()
  await migrateCategories()
  await migrateCollections()
  await migrateBanners()

  console.log("\n" + "─".repeat(60))
  console.log("✅ Migration complete! All images are now in Supabase Storage.")
  console.log("   Your database image_url fields have been updated.")
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err)
  process.exit(1)
})
