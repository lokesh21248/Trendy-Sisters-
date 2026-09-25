"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, Star } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import type { ProductWithImages } from "@/types"

import { getSafeImageUrl, DEFAULT_PRODUCT_IMAGE } from "@/lib/image-utils"

interface ProductCardProps {
  product: ProductWithImages
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price)
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, loading: cartLoading } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const [adding, setAdding] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [imgError, setImgError] = useState(false)

  const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || []
  const primaryImage = images[0]?.image_url
  const secondaryImage = images[1]?.image_url

  const wishlisted = isWishlisted(product.id)
  const discount = product.discount || Math.round(((product.mrp - product.price) / product.mrp) * 100)

  const rawSrc = images[imageIndex]?.image_url || primaryImage
  const currentSrc = imgError ? DEFAULT_PRODUCT_IMAGE : getSafeImageUrl(rawSrc)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    await addItem(product.id)
    setAdding(false)
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggle(product.id)
  }

  return (
    <Link href={`/product/${product.slug}`} className="product-card group flex flex-col w-full">
      {/* Image container — 3:4 ratio for portrait products */}
      <div
        className="img-zoom-container relative overflow-hidden bg-gray-50"
        style={{ aspectRatio: "3/4", width: "100%" }}
        onMouseEnter={() => secondaryImage && setImageIndex(1)}
        onMouseLeave={() => setImageIndex(0)}
      >
        {primaryImage ? (
          <Image
            src={currentSrc}
            alt={product.name}
            fill
            className="object-cover transition-all duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "var(--ivory-dark)" }}
          >
            <ShoppingBag size={36} style={{ color: "var(--burgundy)", opacity: 0.3 }} />
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2">
            <span className="discount-badge">-{Math.round(discount)}%</span>
          </div>
        )}

        {/* New badge */}
        {product.is_new && (
          <div className="absolute left-2" style={{ top: discount > 0 ? 28 : 8 }}>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "var(--gold)", color: "white" }}
            >
              NEW
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90"
          style={{
            backgroundColor: wishlisted ? "var(--burgundy)" : "rgba(255,255,255,0.92)",
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={13}
            fill={wishlisted ? "white" : "none"}
            stroke={wishlisted ? "white" : "var(--burgundy)"}
          />
        </button>

        {/* Image dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.slice(0, 2).map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ backgroundColor: i === imageIndex ? "white" : "rgba(255,255,255,0.5)" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        {/* Name */}
        <h3
          className="leading-tight line-clamp-2 mb-0.5"
          style={{
            color: "var(--charcoal)",
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(0.72rem, 2.5vw, 0.875rem)",
            fontWeight: 600,
          }}
        >
          {product.name}
        </h3>

        {/* Fabric */}
        {product.fabric && (
          <p className="text-[11px] mb-1" style={{ color: "#9B8A7A" }}>
            {product.fabric}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={9}
              fill={star <= 4 ? "var(--gold)" : "none"}
              stroke={star <= 4 ? "var(--gold)" : "#D5C4A1"}
            />
          ))}
          <span className="text-[10px] ml-0.5" style={{ color: "#9B8A7A" }}>(4.2)</span>
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between gap-1 mt-auto">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="font-bold" style={{ color: "var(--burgundy)", fontSize: "clamp(0.8rem, 3vw, 1rem)" }}>
                {formatPrice(product.price)}
              </span>
              <span className="text-[11px] line-through" style={{ color: "#9B8A7A" }}>
                {formatPrice(product.mrp)}
              </span>
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-semibold" style={{ color: "var(--gold)" }}>
                {Math.round(discount)}% off
              </span>
            )}
          </div>

          {/* ADD button */}
          <button
            onClick={handleAddToCart}
            disabled={adding || cartLoading || product.stock === 0}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 active:scale-95"
            style={{
              backgroundColor: product.stock === 0 ? "#E5D8C0" : "var(--burgundy)",
              color: "white",
              minWidth: 44,
              minHeight: 32,
            }}
            aria-label={product.stock === 0 ? "Out of stock" : "Add to cart"}
          >
            {adding ? (
              <span className="w-3 h-3 border border-white/60 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingBag size={11} />
            )}
            {product.stock === 0 ? "Sold" : "ADD"}
          </button>
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border w-full" style={{ borderColor: "var(--border)" }}>
      <div className="skeleton" style={{ aspectRatio: "3/4", width: "100%" }} />
      <div className="p-2.5 space-y-2">
        <div className="skeleton h-3.5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
      </div>
    </div>
  )
}
