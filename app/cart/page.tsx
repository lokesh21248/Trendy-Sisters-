"use client"

import { useCart } from "@/contexts/CartContext"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react"
import { getSafeImageUrl } from "@/lib/image-utils"
import type { CartItemWithProduct } from "@/types"

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p)
}

export default function CartPage() {
  const { items, itemCount, total, updateQuantity, removeItem, loading } = useCart()

  const subtotal = items.reduce((sum, item) => sum + (item.products?.mrp || 0) * item.quantity, 0)
  const savings = subtotal - total
  const shipping = total >= 999 ? 0 : 99

  if (itemCount === 0) {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: "var(--ivory-dark)" }}
        >
          <ShoppingBag size={40} style={{ color: "var(--burgundy)", opacity: 0.5 }} />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: "var(--charcoal)" }}>
          Your wardrobe is waiting
        </h2>
        <p className="text-sm text-center mb-8" style={{ color: "#9B8A7A" }}>
          Add your favourite sarees to continue shopping.
        </p>
        <Link
          href="/shop"
          className="px-8 py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-105"
          style={{ backgroundColor: "var(--burgundy)" }}
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen w-full min-w-0 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 w-full min-w-0 box-border">
        <h1 className="font-serif text-2xl lg:text-3xl font-bold mb-1.5" style={{ color: "var(--charcoal)" }}>
          Shopping Cart
        </h1>
        <p className="text-xs sm:text-sm mb-6 sm:mb-8" style={{ color: "#9B8A7A" }}>
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full min-w-0">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4 w-full min-w-0">
            {items.map((item) => {
              const product = item.products
              const primaryImage = product?.product_images?.find((i) => i.is_primary)?.image_url
                || product?.product_images?.[0]?.image_url
              return (
                <div
                  key={item.id}
                  className="flex gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl w-full min-w-0 box-border"
                  style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
                >
                  {/* Image */}
                  <Link href={`/product/${product?.slug}`} className="shrink-0">
                    <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden bg-[var(--ivory-dark)]">
                      {primaryImage ? (
                        <Image
                          src={getSafeImageUrl(primaryImage)}
                          alt={product?.name || ""}
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 640px) 80px, 96px"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: "var(--ivory-dark)" }} />
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${product?.slug}`} className="block min-w-0">
                        <h3
                          className="font-semibold text-xs sm:text-sm leading-snug mb-1 hover:text-burgundy transition-colors break-words"
                          style={{ color: "var(--charcoal)", overflowWrap: "anywhere" }}
                        >
                          {product?.name}
                        </h3>
                      </Link>
                      {product?.fabric && (
                        <p className="text-[11px] sm:text-xs mb-2 line-clamp-1" style={{ color: "#9B8A7A" }}>
                          {product.fabric}
                        </p>
                      )}
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between gap-2 pt-1 w-full min-w-0">
                      {/* Price */}
                      <div className="min-w-0">
                        <span className="font-bold text-sm sm:text-base break-words" style={{ color: "var(--burgundy)" }}>
                          {formatPrice(product?.price || 0)}
                        </span>
                        {product?.mrp && product.mrp > product.price && (
                          <span className="text-[11px] sm:text-xs line-through ml-1.5 shrink-0" style={{ color: "#9B8A7A" }}>
                            {formatPrice(product.mrp)}
                          </span>
                        )}
                      </div>

                      {/* Quantity */}
                      <div
                        className="flex items-center rounded-lg overflow-hidden shrink-0 self-start min-[420px]:self-auto"
                        style={{ border: "1px solid var(--border)", backgroundColor: "white" }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-[var(--ivory-dark)] transition-colors text-xs active:scale-95"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 py-1.5 text-xs sm:text-sm font-semibold min-w-[28px] sm:min-w-[30px] text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 hover:bg-[var(--ivory-dark)] transition-colors active:scale-95"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <div className="pt-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-1 text-[11px] sm:text-xs transition-colors hover:text-red-600"
                        style={{ color: "#9B8A7A" }}
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Coupon */}
            <div
              className="flex flex-col min-[380px]:flex-row gap-2 p-3.5 sm:p-4 rounded-2xl w-full min-w-0 box-border"
              style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
            >
              <div className="flex-1 relative min-w-0">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--gold)" }} />
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs sm:text-sm outline-none box-border"
                  style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}
                />
              </div>
              <button
                className="w-full min-[380px]:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm text-white shrink-0 transition-opacity hover:opacity-90 active:scale-98"
                style={{ backgroundColor: "var(--burgundy)" }}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1 w-full min-w-0">
            <div
              className="sticky top-24 sm:top-28 p-4 sm:p-6 rounded-2xl w-full min-w-0 box-border"
              style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
            >
              <h2 className="font-semibold text-base mb-4 sm:mb-5" style={{ color: "var(--charcoal)" }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-5 w-full min-w-0">
                <div className="flex items-baseline justify-between gap-3 text-xs sm:text-sm w-full min-w-0">
                  <span className="shrink min-w-0 break-words" style={{ color: "#9B8A7A" }}>
                    Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                  </span>
                  <span
                    className="text-right font-medium shrink-0 max-w-[60%] break-words"
                    style={{ color: "var(--charcoal)", overflowWrap: "anywhere" }}
                  >
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-3 text-xs sm:text-sm w-full min-w-0">
                  <span className="shrink min-w-0 break-words" style={{ color: "#9B8A7A" }}>Discount</span>
                  <span
                    className="text-right font-semibold shrink-0 max-w-[60%] break-words"
                    style={{ color: "var(--gold)", overflowWrap: "anywhere" }}
                  >
                    -{formatPrice(savings)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-3 text-xs sm:text-sm w-full min-w-0">
                  <span className="shrink min-w-0 break-words" style={{ color: "#9B8A7A" }}>Shipping</span>
                  <span
                    className="text-right font-medium shrink-0 max-w-[60%] break-words"
                    style={{ color: shipping === 0 ? "green" : "var(--charcoal)", overflowWrap: "anywhere" }}
                  >
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                {total < 999 && (
                  <p
                    className="text-xs px-3 py-2 rounded-lg break-words leading-relaxed"
                    style={{ backgroundColor: "rgba(184,138,59,0.08)", color: "var(--gold-dark)" }}
                  >
                    Add {formatPrice(999 - total)} more to get free shipping!
                  </p>
                )}
              </div>

              <div
                className="flex items-baseline justify-between gap-3 py-3.5 sm:py-4 border-t font-bold w-full min-w-0"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="shrink-0" style={{ color: "var(--charcoal)" }}>Total</span>
                <span
                  className="text-base sm:text-lg text-right break-words max-w-[70%]"
                  style={{ color: "var(--burgundy)", overflowWrap: "anywhere" }}
                >
                  {formatPrice(total + shipping)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white mt-4 transition-all hover:scale-[1.01] active:scale-[0.99] box-border text-center shadow-sm"
                style={{ backgroundColor: "var(--burgundy)" }}
              >
                <span>Proceed to Checkout</span> <ArrowRight size={16} className="shrink-0" />
              </Link>

              <Link
                href="/shop"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm mt-3 transition-colors hover:bg-[var(--ivory)] box-border text-center"
                style={{ color: "var(--charcoal)" }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
