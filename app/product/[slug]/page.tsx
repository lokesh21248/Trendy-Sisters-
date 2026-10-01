"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, notFound, useRouter } from "next/navigation"
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
  const [buying, setBuying] = useState(false)
  const router = useRouter()

  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const supabase = createClient()

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      let { data } = await supabase
        .from("products")
        .select("*, product_images(*), categories(*)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle()

      if (!data) {
        const { data: byId } = await supabase
          .from("products")
          .select("*, product_images(*), categories(*)")
          .eq("id", slug)
          .eq("is_active", true)
          .maybeSingle()
        data = byId
      }

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

  const handleBuyNow = async () => {
    if (!product || buying) return
    setBuying(true)
    try {
      await addItem(product.id, quantity, product)
      router.push("/checkout")
    } catch (e) {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full min-w-0 box-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full min-w-0">
          <div className="skeleton rounded-2xl w-full aspect-[4/5]" />
          <div className="space-y-4 w-full min-w-0">
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
    <div style={{ backgroundColor: "var(--ivory)" }} className="w-full min-w-0 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full min-w-0 box-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full min-w-0">
          {/* Image gallery */}
          <div className="w-full min-w-0 max-w-full">
            {/* Main image */}
            <div className="relative w-full max-w-full overflow-hidden rounded-2xl mb-3 aspect-[4/5] sm:aspect-[4/5] max-h-[65vh] sm:max-h-none bg-[var(--ivory-dark)] shadow-sm box-border">
              {images[selectedImage]?.image_url ? (
                <Image
                  src={getSafeImageUrl(images[selectedImage].image_url)}
                  alt={product.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--ivory-dark)" }}>
                  <ShoppingBag size={60} style={{ color: "var(--burgundy)", opacity: 0.2 }} />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="discount-badge text-xs sm:text-sm px-2.5 sm:px-3 py-1 font-bold shadow-sm">
                    -{Math.round(discount)}%
                  </span>
                </div>
              )}
              {/* Floating Wishlist Heart */}
              <button
                onClick={() => toggle(product.id)}
                className="absolute top-3.5 right-3.5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--border)] shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  size={19}
                  fill={wishlisted ? "var(--burgundy)" : "none"}
                  stroke="var(--burgundy)"
                />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="w-full min-w-0 max-w-full overflow-hidden">
                <div className="flex gap-2.5 overflow-x-auto category-scroll w-full min-w-0 py-1 px-0.5 box-border">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className="relative shrink-0 overflow-hidden rounded-xl border-2 transition-all w-16 h-20 sm:w-[72px] sm:h-[90px] focus:outline-none"
                      style={{
                        borderColor: i === selectedImage ? "var(--burgundy)" : "var(--border)",
                        boxShadow: i === selectedImage ? "0 0 0 1px var(--burgundy)" : "none",
                      }}
                      aria-label={`View image ${i + 1}`}
                    >
                      <Image
                        src={getSafeImageUrl(img.image_url)}
                        alt=""
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 64px, 72px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="w-full min-w-0 max-w-full">
            {/* Category */}
            {(product as any).categories && (
              <span className="inline-block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
                {(product as any).categories.name}
              </span>
            )}

            {/* Title */}
            <h1
              className="font-serif text-2xl sm:text-3xl font-bold leading-tight break-words text-[var(--charcoal)] mt-1 mb-2 sm:mb-3 w-full min-w-0"
              style={{ overflowWrap: "anywhere" }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4 w-full min-w-0">
              <div className="flex items-center shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} fill={s <= 4 ? "var(--gold)" : "none"} stroke={s <= 4 ? "var(--gold)" : "#D5C4A1"} />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-medium" style={{ color: "#9B8A7A" }}>
                4.2 (48 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-4 sm:mb-5 w-full min-w-0">
              <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3 w-full min-w-0">
                <span className="font-serif text-2xl sm:text-3xl font-bold leading-none" style={{ color: "var(--burgundy)" }}>
                  {formatPrice(product.price)}
                </span>
                <span className="text-base sm:text-lg line-through leading-none" style={{ color: "#9B8A7A" }}>
                  {formatPrice(product.mrp)}
                </span>
                {discount > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-lg text-xs sm:text-sm font-bold shrink-0"
                    style={{ backgroundColor: "rgba(101,31,53,0.1)", color: "var(--burgundy)" }}
                  >
                    {Math.round(discount)}% off
                  </span>
                )}
              </div>
              <p className="text-xs mt-1.5 leading-normal" style={{ color: "#9B8A7A" }}>
                Inclusive of all taxes. Free shipping above ₹999.
              </p>
            </div>

            {/* Quick details */}
            <div
              className="w-full min-w-0 grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-5 p-4 sm:p-5 rounded-xl mb-5 box-border"
              style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}
            >
              {[
                { label: "Fabric", value: product.fabric || "N/A" },
                { label: "Color", value: product.color || "N/A" },
                { label: "Occasion", value: product.occasion || "N/A" },
                { label: "Stock", value: product.stock > 0 ? `${product.stock} available` : "Out of stock" },
              ].map((d) => (
                <div key={d.label} className="min-w-0">
                  <span className="block text-xs mb-0.5 font-medium" style={{ color: "#9B8A7A" }}>
                    {d.label}
                  </span>
                  <p
                    className="text-sm font-semibold break-words leading-snug"
                    style={{ color: "var(--charcoal)", overflowWrap: "anywhere" }}
                  >
                    {d.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5 w-full min-w-0">
              <span className="text-sm font-medium shrink-0" style={{ color: "var(--charcoal)" }}>Quantity:</span>
              <div
                className="flex items-center rounded-xl overflow-hidden shrink-0"
                style={{ border: "1px solid var(--border)", backgroundColor: "white" }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-[var(--ivory-dark)] transition-colors active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3.5 py-2 text-sm font-semibold min-w-[36px] text-center select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 hover:bg-[var(--ivory-dark)] transition-colors active:scale-95"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Action buttons (Add to Cart & Buy Now) */}
            <div className="w-full min-w-0 space-y-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm box-border"
                style={{ backgroundColor: added ? "#15803d" : "var(--burgundy)" }}
              >
                {adding ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : added ? (
                  <span>✓ Added to Cart!</span>
                ) : (
                  <ShoppingBag size={17} />
                )}
                {!adding && !added && (product.stock === 0 ? "Out of Stock" : "Add to Cart")}
              </button>

              {product.stock > 0 && (
                <button
                  onClick={handleBuyNow}
                  disabled={buying || product.stock === 0}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl font-semibold text-sm border-2 transition-all hover:scale-[1.01] active:scale-[0.99] box-border disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: "var(--burgundy)",
                    color: "var(--burgundy)",
                    backgroundColor: "transparent",
                  }}
                >
                  {buying ? (
                    <span className="w-4 h-4 border-2 border-[var(--burgundy)]/40 border-t-[var(--burgundy)] rounded-full animate-spin" />
                  ) : (
                    "Buy Now"
                  )}
                </button>
              )}
            </div>

            {/* Trust badges */}
            <div className="w-full min-w-0 max-w-full overflow-hidden mb-6">
              <div className="flex sm:grid sm:grid-cols-3 gap-2.5 sm:gap-3 overflow-x-auto category-scroll w-full min-w-0 py-1 px-0.5 box-border">
                {[
                  { icon: Truck, label: "Free Shipping" },
                  { icon: RefreshCw, label: "Easy Returns" },
                  { icon: ShieldCheck, label: "Authentic" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-center shrink-0 w-[115px] sm:w-auto h-20 box-border"
                    style={{ backgroundColor: "var(--ivory-dark)" }}
                  >
                    <b.icon size={18} style={{ color: "var(--burgundy)" }} />
                    <span className="text-[11px] font-medium leading-tight" style={{ color: "var(--charcoal)" }}>
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accordion sections */}
            <div className="space-y-2 w-full min-w-0">
              {infoSections.map((sec) => (
                <div
                  key={sec.id}
                  className="w-full min-w-0 rounded-xl overflow-hidden box-border"
                  style={{ border: "1px solid var(--border)", backgroundColor: "white" }}
                >
                  <button
                    onClick={() => setExpandedSection(expandedSection === sec.id ? null : sec.id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[var(--ivory)]"
                  >
                    <span className="text-sm font-semibold min-w-0 break-words pr-2" style={{ color: "var(--charcoal)" }}>
                      {sec.title}
                    </span>
                    {expandedSection === sec.id ? (
                      <ChevronUp size={16} className="shrink-0" style={{ color: "#9B8A7A" }} />
                    ) : (
                      <ChevronDown size={16} className="shrink-0" style={{ color: "#9B8A7A" }} />
                    )}
                  </button>
                  {expandedSection === sec.id && (
                    <div
                      className="px-4 pb-4 pt-1 text-sm break-words leading-relaxed"
                      style={{ color: "#6B5B4A", overflowWrap: "anywhere" }}
                    >
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
          <section className="mt-12 sm:mt-16 w-full min-w-0">
            <h2 className="section-heading mb-4 sm:mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5 w-full min-w-0">
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
