import { Product, ProductImage, DesignCompleteness } from "@/types/admin"

/**
 * Computes design completeness score (0-100%) based on 6 core criteria:
 * - Fabric defined (+20%)
 * - Color swatch selected (+20%)
 * - Occasion categorized (+20%)
 * - High-resolution gallery has >= 2 images (+20%)
 * - Pricing valid (price < mrp, discount calculated) (+10%)
 * - SKU and Stock assigned (+10%)
 */
export function calculateDesignCompleteness(
  product: Partial<Product>,
  images: ProductImage[] = []
): DesignCompleteness {
  const missingFields: string[] = []

  // 1. Fabric defined (+20%)
  const hasFabric = Boolean(product.fabric && product.fabric.trim().length > 0)
  if (!hasFabric) missingFields.push("Fabric Material")

  // 2. Color swatch selected (+20%)
  const hasColor = Boolean(product.color && product.color.trim().length > 0)
  if (!hasColor) missingFields.push("Color Shade")

  // 3. Occasion categorized (+20%)
  const hasOccasion = Boolean(product.occasion && product.occasion.trim().length > 0)
  if (!hasOccasion) missingFields.push("Occasion Tag")

  // 4. Gallery >= 2 images (+20%)
  const imageCount = images.length
  const hasEnoughImages = imageCount >= 2
  if (!hasEnoughImages) {
    missingFields.push(
      imageCount === 0
        ? "Product Images (0/2 uploaded)"
        : "Product Images (1/2 uploaded - Need Pallu/Border close-up)"
    )
  }

  // 5. Pricing valid (+10%)
  const price = Number(product.price) || 0
  const mrp = Number(product.mrp) || 0
  const hasValidPrice = price > 0 && mrp > 0 && price <= mrp
  let calculatedDiscount = 0
  if (mrp > 0 && price > 0 && price <= mrp) {
    calculatedDiscount = Math.round(((mrp - price) / mrp) * 100)
  }
  if (!hasValidPrice) {
    if (price <= 0 || mrp <= 0) missingFields.push("Pricing (Price/MRP missing)")
    else if (price > mrp) missingFields.push("Pricing (Selling price exceeds MRP)")
  }

  // 6. SKU and Stock assigned (+10%)
  const hasSku = Boolean(product.sku && product.sku.trim().length > 0)
  const hasStock = product.stock !== undefined && product.stock !== null && Number(product.stock) >= 0
  const hasStockAndSku = hasSku && hasStock
  if (!hasSku) missingFields.push("SKU Identifier")
  if (!hasStock) missingFields.push("Stock Count")

  let score = 0
  if (hasFabric) score += 20
  if (hasColor) score += 20
  if (hasOccasion) score += 20
  if (hasEnoughImages) score += 20
  if (hasValidPrice) score += 10
  if (hasStockAndSku) score += 10

  return {
    score,
    criteria: {
      fabric: {
        id: "fabric",
        label: "Fabric Material",
        description: "Pure Silk, Banarasi, Kanjivaram, Cotton, etc.",
        weight: 20,
        passed: hasFabric,
        value: product.fabric || null,
      },
      color: {
        id: "color",
        label: "Color Swatch",
        description: "Primary Saree Shade & Palette swatch",
        weight: 20,
        passed: hasColor,
        value: product.color || null,
      },
      occasion: {
        id: "occasion",
        label: "Occasion Categorization",
        description: "Wedding, Bridal, Festive Luxe, Casual, etc.",
        weight: 20,
        passed: hasOccasion,
        value: product.occasion || null,
      },
      images: {
        id: "images",
        label: "High-Res Gallery",
        description: "Primary drape + Pallu/Border detail (min 2 angles)",
        weight: 20,
        passed: hasEnoughImages,
        imageCount,
      },
      pricing: {
        id: "pricing",
        label: "Valid Pricing & MRP",
        description: "Price < MRP with auto-calculated discount percentage",
        weight: 10,
        passed: hasValidPrice,
        discount: calculatedDiscount,
      },
      stockSku: {
        id: "stockSku",
        label: "SKU & Inventory Count",
        description: "Unique inventory SKU and positive stock level",
        weight: 10,
        passed: hasStockAndSku,
        value: product.sku ? `${product.sku} (${product.stock ?? 0} in stock)` : null,
      },
    },
    missingFields,
    isReadyForPublish: score === 100,
  }
}
