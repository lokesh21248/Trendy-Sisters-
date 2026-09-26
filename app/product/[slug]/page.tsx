"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, notFound } from "next/navigation"
import { Star, Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, ChevronDown, ChevronUp, Minus, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { ProductCard } from "@/components/products/ProductCard"
import { getSafeImageUrl, sanitizeProduct } from "@/lib/image-utils"
import type { ProductWithImages } from "@/types"

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p)
}

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [related, setRelated] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>("description")

  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const supabase = createClient()

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), categories(*)")
        .eq("slug", slug)
        .eq("is_active", true)
        .single()

      if (!data) { setLoading(false); return }
      const typedData = sanitizeProduct(data as any);
      setProduct(typedData)

      // Related products
      const { data: rel } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq("category_id", typedData.category_id)
        .eq("is_active", true)
        .neq("id", typedData.id)
        .limit(4)

      setRelated(((rel || []) as any[]).map(sanitizeProduct) as ProductWithImages[])
      setLoading(false)
    }

    fetchProduct()
  }, [slug, supabase])

  const [added, setAdded] = useState(false)

  const handleAddToCart = async () => {
    if (!product || adding) return
    setAdding(true)
    try {
      await addItem(product.id, quantity, product)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="skeleton rounded-2xl" style={{ aspectRatio: "4/5" }} />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-5 w-1/2 rounded" />
            <div className="skeleton h-10 w-1/3 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-xl" style={{ color: "#9B8A7A" }}>Product not found</p>
      </div>
    )
  }

  const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || []
  const discount = product.discount || Math.round(((product.mrp - product.price) / product.mrp) * 100)
  const wishlisted = isWishlisted(product.id)

  const infoSections = [
    {
      id: "description",
      title: "Description",
      content: product.description || "No description available.",
    },
    {
      id: "fabric",
      title: "Fabric & Details",
      content: `Fabric: ${product.fabric || "N/A"} | Color: ${product.color || "N/A"} | Occasion: ${product.occasion || "N/A"}`,
    },
    {
      id: "care",
      title: "Care Instructions",
      content: "Dry clean only. Store in a cool, dry place. Avoid prolonged exposure to direct sunlight.",
    },
    {
      id: "shipping",
      title: "Shipping & Returns",
      content: "Free shipping on orders above ₹999. Delivered in 3–7 business days. 15-day hassle-free returns.",
    },
  ]

  return (
    <div style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image gallery */}
          <div>
            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl mb-3" style={{ aspectRatio: "4/5" }}>
              {images[selectedImage]?.image_url ? (
                <Image
                  src={getSafeImageUrl(images[selectedImage].image_url)}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--ivory-dark)" }}>
                  <ShoppingBag size={60} style={{ color: "var(--burgundy)", opacity: 0.2 }} />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="discount-badge text-sm px-3 py-1">-{Math.round(discount)}%</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto category-scroll">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className="relative flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all"
                    style={{
                      width: 72, height: 90,
                      borderColor: i === selectedImage ? "var(--burgundy)" : "var(--border)",
                    }}
                  >
                    <Image src={getSafeImageUrl(img.image_url)} alt="" fill className="object-cover" sizes="72px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            {/* Category */}
            {(product as any).categories && (
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
                {(product as any).categories.name}
              </span>
            )}

            <h1 className="font-serif text-2xl lg:text-3xl font-bold mt-2 mb-3" style={{ color: "var(--charcoal)" }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill={s <= 4 ? "var(--gold)" : "none"} stroke={s <= 4 ? "var(--gold)" : "#D5C4A1"} />
                ))}
              </div>
              <span className="text-sm" style={{ color: "#9B8A7A" }}>4.2 (48 reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-5">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold" style={{ color: "var(--burgundy)" }}>
                  {formatPrice(product.price)}
                </span>
                <span className="text-lg line-through" style={{ color: "#9B8A7A" }}>
                  {formatPrice(product.mrp)}
                </span>
                {discount > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-lg text-sm font-bold"
                    style={{ backgroundColor: "rgba(101,31,53,0.1)", color: "var(--burgundy)" }}
                  >
                    {Math.round(discount)}% off
                  </span>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: "#9B8A7A" }}>
                Inclusive of all taxes. Free shipping above ₹999.
              </p>
            </div>

            {/* Quick details */}
            <div
              className="grid grid-cols-2 gap-3 p-4 rounded-xl mb-5"
              style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}
            >
              {[
                { label: "Fabric", value: product.fabric || "N/A" },
                { label: "Color", value: product.color || "N/A" },
                { label: "Occasion", value: product.occasion || "N/A" },
                { label: "Stock", value: product.stock > 0 ? `${product.stock} available` : "Out of stock" },
              ].map((d) => (
                <div key={d.label}>
                  <span className="text-xs" style={{ color: "#9B8A7A" }}>{d.label}</span>
                  <p className="text-sm font-semibold" style={{ color: "var(--charcoal)" }}>{d.value}</p>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-medium" style={{ color: "var(--charcoal)" }}>Quantity:</span>
              <div
                className="flex items-center rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-ivory-dark transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 hover:bg-ivory-dark transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: added ? "#15803d" : "var(--burgundy)" }}
              >
                {adding ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : added ? (
                  <span>✓ Added to Cart!</span>
                ) : (
                  <ShoppingBag size={16} />
                )}
                {!adding && !added && (product.stock === 0 ? "Out of Stock" : "Add to Cart")}
              </button>

              <button
                onClick={() => toggle(product.id)}
                className="px-4 py-3.5 rounded-xl border-2 transition-all hover:scale-105"
                style={{
                  borderColor: wishlisted ? "var(--burgundy)" : "var(--border)",
                  backgroundColor: wishlisted ? "rgba(101,31,53,0.05)" : "white",
                }}
              >
                <Heart
                  size={18}
                  fill={wishlisted ? "var(--burgundy)" : "none"}
                  stroke="var(--burgundy)"
                />
              </button>
            </div>

            {/* Buy now */}
            {product.stock > 0 && (
              <button
                className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 transition-all hover:scale-[1.02] mb-6"
                style={{ borderColor: "var(--burgundy)", color: "var(--burgundy)", backgroundColor: "transparent" }}
              >
                Buy Now
              </button>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: RefreshCw, label: "Easy Returns" },
                { icon: ShieldCheck, label: "Authentic" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
                  style={{ backgroundColor: "var(--ivory-dark)" }}
                >
                  <b.icon size={18} style={{ color: "var(--burgundy)" }} />
                  <span className="text-[11px] font-medium" style={{ color: "var(--charcoal)" }}>
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Accordion sections */}
            <div className="space-y-2">
              {infoSections.map((sec) => (
                <div
                  key={sec.id}
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <button
                    onClick={() => setExpandedSection(expandedSection === sec.id ? null : sec.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold" style={{ color: "var(--charcoal)" }}>
                      {sec.title}
                    </span>
                    {expandedSection === sec.id ? (
                      <ChevronUp size={16} style={{ color: "#9B8A7A" }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: "#9B8A7A" }} />
                    )}
                  </button>
                  {expandedSection === sec.id && (
                    <div className="px-4 pb-4 text-sm" style={{ color: "#6B5B4A" }}>
                      {sec.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="section-heading mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
