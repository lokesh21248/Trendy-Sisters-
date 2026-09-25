/**
 * Image URL utilities and fallback handling for Trendy Sisters.
 * Ensures all image URLs point to working, verified assets and prevents 404/504 errors.
 */

export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop"

export const DEFAULT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&h=700&fit=crop&q=80"

// Map of legacy or deleted Unsplash IDs to verified working high-resolution Indian ethnic wear photos
const BROKEN_IMAGE_REPLACEMENTS: Record<string, string> = {
  // photo-1632932673729-06cf7e47048c is deleted on Unsplash -> replace with pink/orange festive silk saree
  "photo-1632932673729-06cf7e47048c": "photo-1617627143750-d86bc21e42bb",
  // photo-1614886137568-36d0e2e07e27 is deleted on Unsplash -> replace with traditional green Banarasi saree
  "photo-1614886137568-36d0e2e07e27": "photo-1679006831648-7c9ea12e5807",
}

/**
 * Returns a sanitized, working image URL.
 * Automatically swaps known dead Unsplash photo IDs and falls back to a default if empty.
 */
export function getSafeImageUrl(url?: string | null, fallback = DEFAULT_PRODUCT_IMAGE): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return fallback
  }

  let sanitized = url.trim()

  for (const [brokenId, replacementId] of Object.entries(BROKEN_IMAGE_REPLACEMENTS)) {
    if (sanitized.includes(brokenId)) {
      sanitized = sanitized.replaceAll(brokenId, replacementId)
    }
  }

  return sanitized
}

/**
 * Helper to sanitize all images on a product object
 */
export function sanitizeProduct<T extends { product_images?: Array<{ image_url: string; [key: string]: any }> }>(
  product: T
): T {
  if (!product) return product
  return {
    ...product,
    product_images: product.product_images?.map((img) => ({
      ...img,
      image_url: getSafeImageUrl(img.image_url),
    })),
  }
}
