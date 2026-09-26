import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"

function getAdminSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
  // Prefer publishable/anon key which has full RLS permissions via enable-admin-access.sql
  const apiKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"

  return createSupabaseClient<Database>(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function sanitizeUuid(val: any): string | null {
  if (!val || typeof val !== "string") return null
  const trimmed = val.trim()
  if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "none" || trimmed === "all") {
    return null
  }
  return UUID_REGEX.test(trimmed) ? trimmed : null
}

// GET /api/admin/products
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient()
    const { data: products, error } = await supabase
      .from("products")
      .select("*, product_images(*), categories(*), collections(*)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API /api/admin/products GET] Supabase error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, products },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/admin/products (Create New Product)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { product, initialImageUrls } = body

    if (!product || !product.name) {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabaseClient()

    const price = Number(product.price) || 0
    const mrp = Number(product.mrp) || 0
    const discount =
      mrp > 0 && price <= mrp ? Math.round(((mrp - price) / mrp) * 100) : 0

    const slug =
      product.slug ||
      product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const newProductData: any = {
      name: String(product.name).trim(),
      slug,
      sku: product.sku ? String(product.sku).trim() : `TS-${Math.floor(1000 + Math.random() * 9000)}`,
      description: product.description || "",
      short_description: product.short_description ? String(product.short_description).trim() : null,
      price,
      mrp,
      discount,
      fabric: product.fabric ? String(product.fabric).trim() : null,
      color: product.color ? String(product.color).trim() : null,
      occasion: product.occasion ? String(product.occasion).trim() : null,
      stock: product.stock !== undefined ? Math.max(0, parseInt(String(product.stock), 10) || 0) : 10,
      is_new: product.is_new ?? true,
      is_bestseller: product.is_bestseller ?? false,
      is_featured: product.is_featured ?? false,
      is_active: product.is_active ?? true,
      category_id: sanitizeUuid(product.category_id),
      collection_id: sanitizeUuid(product.collection_id),
    }

    console.log("[API /api/admin/products POST] Inserting product:", newProductData)

    const { data: createdProduct, error: insertErr } = await (supabase as any)
      .from("products")
      .insert([newProductData])
      .select("*, product_images(*)")
      .maybeSingle()

    if (insertErr) {
      console.error("[API /api/admin/products POST] Insert error:", insertErr)
      return NextResponse.json(
        { success: false, error: insertErr.message },
        { status: 500 }
      )
    }

    if (!createdProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Database insert returned 0 rows. Please verify Supabase RLS policies.",
        },
        { status: 500 }
      )
    }

    // Insert initial images if provided
    if (Array.isArray(initialImageUrls) && initialImageUrls.length > 0) {
      const imageRows = initialImageUrls.map((img: any, idx: number) => ({
        product_id: (createdProduct as any).id,
        image_url: typeof img === "string" ? img : img.url,
        sort_order: img.sort_order ?? idx,
        is_primary: img.is_primary ?? idx === 0,
      }))

      await (supabase as any).from("product_images").insert(imageRows)
    }

    // Revalidate paths
    try {
      revalidatePath("/")
      revalidatePath("/shop")
      revalidatePath(`/product/${slug}`)
      revalidatePath("/admin")
      revalidatePath("/admin/products")
    } catch (e) {}

    return NextResponse.json({
      success: true,
      product: createdProduct,
    })
  } catch (err: any) {
    console.error("[API /api/admin/products POST] Exception:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PUT /api/admin/products (Update Product & Sync Images)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, updates, product_images } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabaseClient()

    const sanitizedUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (updates) {
      if ("name" in updates && updates.name !== undefined) {
        sanitizedUpdates.name = String(updates.name).trim()
      }
      if ("slug" in updates && updates.slug !== undefined) {
        sanitizedUpdates.slug = String(updates.slug).trim()
      }
      if ("sku" in updates) {
        sanitizedUpdates.sku = updates.sku ? String(updates.sku).trim() : null
      }
      if ("description" in updates) {
        sanitizedUpdates.description = updates.description !== undefined ? String(updates.description) : ""
      }
      if ("short_description" in updates) {
        sanitizedUpdates.short_description = updates.short_description ? String(updates.short_description).trim() : null
      }
      if ("price" in updates && updates.price !== undefined) {
        sanitizedUpdates.price = Number(updates.price) || 0
      }
      if ("mrp" in updates && updates.mrp !== undefined) {
        sanitizedUpdates.mrp = Number(updates.mrp) || 0
      }
      if ("discount" in updates && updates.discount !== undefined) {
        sanitizedUpdates.discount = Number(updates.discount) || 0
      }
      if ("fabric" in updates) {
        sanitizedUpdates.fabric = updates.fabric ? String(updates.fabric).trim() : null
      }
      if ("color" in updates) {
        sanitizedUpdates.color = updates.color ? String(updates.color).trim() : null
      }
      if ("occasion" in updates) {
        sanitizedUpdates.occasion = updates.occasion ? String(updates.occasion).trim() : null
      }
      if ("stock" in updates && updates.stock !== undefined) {
        sanitizedUpdates.stock = Math.max(0, parseInt(String(updates.stock), 10) || 0)
      }
      if ("is_new" in updates && updates.is_new !== undefined) {
        sanitizedUpdates.is_new = Boolean(updates.is_new)
      }
      if ("is_bestseller" in updates && updates.is_bestseller !== undefined) {
        sanitizedUpdates.is_bestseller = Boolean(updates.is_bestseller)
      }
      if ("is_featured" in updates && updates.is_featured !== undefined) {
        sanitizedUpdates.is_featured = Boolean(updates.is_featured)
      }
      if ("is_active" in updates && updates.is_active !== undefined) {
        sanitizedUpdates.is_active = Boolean(updates.is_active)
      }
      if ("category_id" in updates) {
        sanitizedUpdates.category_id = sanitizeUuid(updates.category_id)
      }
      if ("collection_id" in updates) {
        sanitizedUpdates.collection_id = sanitizeUuid(updates.collection_id)
      }
    }

    // Auto-calculate discount if price and mrp are provided
    const price = Number(sanitizedUpdates.price ?? updates?.price)
    const mrp = Number(sanitizedUpdates.mrp ?? updates?.mrp)
    if (mrp > 0 && price > 0 && price <= mrp) {
      sanitizedUpdates.discount = Math.round(((mrp - price) / mrp) * 100)
    }

    console.log(`[API /api/admin/products PUT] Updating product ${id}:`, sanitizedUpdates)

    // 1. Update products table in Supabase
    const { data: updatedProduct, error: prodError } = await (supabase as any)
      .from("products")
      .update(sanitizedUpdates)
      .eq("id", id)
      .select("*, product_images(*)")
      .maybeSingle()

    if (prodError) {
      console.error(`[API /api/admin/products PUT] Database error on product ${id}:`, prodError)
      return NextResponse.json(
        { success: false, error: prodError.message, code: prodError.code },
        { status: 500 }
      )
    }

    // Check if RLS blocked the update (0 rows returned)
    const rlsBlocked = !updatedProduct
    if (rlsBlocked) {
      console.warn(
        `[API /api/admin/products PUT] WARNING: Update returned 0 rows for product ${id}. RLS policy likely preventing update with current key.`
      )
      return NextResponse.json(
        {
          success: false,
          rlsBlocked: true,
          error:
            "PostgreSQL RLS policy prevented write. Run supabase/enable-admin-access.sql in your Supabase SQL Editor.",
        },
        { status: 403 }
      )
    }

    // 2. If product_images provided, sync them in product_images table
    if (Array.isArray(product_images)) {
      console.log(`[API /api/admin/products PUT] Syncing ${product_images.length} images for product ${id}`)
      // First, remove existing images for this product
      await (supabase as any).from("product_images").delete().eq("product_id", id)

      if (product_images.length > 0) {
        // Insert new/updated images with correct sort_order and is_primary
        const imageRows = product_images.map((img: any, idx: number) => ({
          product_id: id,
          image_url: img.image_url,
          sort_order: img.sort_order ?? idx,
          is_primary: img.is_primary ?? idx === 0,
        }))

        const { error: imgError } = await (supabase as any).from("product_images").insert(imageRows)
        if (imgError) {
          console.warn(`[API /api/admin/products PUT] Image insert warning for ${id}:`, imgError)
        }
      }
    }

    // 3. Cache Invalidation & Revalidation across Customer Website
    const productSlug = sanitizedUpdates.slug || updatedProduct?.slug || updates.slug
    try {
      revalidatePath("/")
      revalidatePath("/shop")
      if (productSlug) {
        revalidatePath(`/product/${productSlug}`)
      }
      revalidatePath("/admin")
      revalidatePath("/admin/products")
      revalidatePath("/admin/design-checker")
      console.log(`[API /api/admin/products PUT] Revalidated paths: /, /shop, /product/${productSlug}`)
    } catch (revalErr) {
      console.warn("[API /api/admin/products PUT] Cache revalidation warning:", revalErr)
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: "Product successfully updated in Supabase database and customer website cache revalidated.",
    })
  } catch (err: any) {
    console.error("[API /api/admin/products PUT] Exception:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/admin/products
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawId = searchParams.get("id")
    const id = sanitizeUuid(rawId)

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Valid Product UUID is required" },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabaseClient()
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    try {
      revalidatePath("/")
      revalidatePath("/shop")
      revalidatePath("/admin/products")
      revalidatePath("/admin/design-checker")
    } catch (e) {}

    return NextResponse.json({ success: true, message: "Product deleted successfully" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
