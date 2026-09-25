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
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <h1 className="font-serif text-2xl lg:text-3xl font-bold mb-2" style={{ color: "var(--charcoal)" }}>
          Shopping Cart
        </h1>
        <p className="text-sm mb-8" style={{ color: "#9B8A7A" }}>{itemCount} item{itemCount !== 1 ? "s" : ""}</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.products
              const primaryImage = product?.product_images?.find((i) => i.is_primary)?.image_url
                || product?.product_images?.[0]?.image_url
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl"
                  style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
                >
                  {/* Image */}
                  <Link href={`/product/${product?.slug}`} className="flex-shrink-0">
                    <div className="relative w-24 h-32 rounded-xl overflow-hidden">
                      {primaryImage ? (
                        <Image src={getSafeImageUrl(primaryImage)} alt={product?.name || ""} fill className="object-cover" sizes="96px" />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: "var(--ivory-dark)" }} />
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${product?.slug}`}>
                      <h3
                        className="font-semibold text-sm leading-snug mb-1 hover:text-burgundy transition-colors"
                        style={{ color: "var(--charcoal)" }}
                      >
                        {product?.name}
                      </h3>
                    </Link>
                    {product?.fabric && (
                      <p className="text-xs mb-2" style={{ color: "#9B8A7A" }}>{product.fabric}</p>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Price */}
                      <div>
                        <span className="font-bold text-base" style={{ color: "var(--burgundy)" }}>
                          {formatPrice(product?.price || 0)}
                        </span>
                        {product?.mrp && product.mrp > product.price && (
                          <span className="text-xs line-through ml-2" style={{ color: "#9B8A7A" }}>
                            {formatPrice(product.mrp)}
                          </span>
                        )}
                      </div>

                      {/* Quantity */}
                      <div
                        className="flex items-center rounded-lg overflow-hidden"
                        style={{ border: "1px solid var(--border)" }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-ivory-dark transition-colors text-xs"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 hover:bg-ivory-dark transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1 mt-2 text-xs transition-colors hover:text-red-600"
                      style={{ color: "#9B8A7A" }}
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Coupon */}
            <div
              className="flex gap-2 p-4 rounded-2xl"
              style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
            >
              <div className="flex-1 relative">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gold)" }} />
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}
                />
              </div>
              <button
                className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white"
                style={{ backgroundColor: "var(--burgundy)" }}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-28 p-6 rounded-2xl"
              style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
            >
              <h2 className="font-semibold text-base mb-5" style={{ color: "var(--charcoal)" }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#9B8A7A" }}>Subtotal ({itemCount} items)</span>
                  <span style={{ color: "var(--charcoal)" }}>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#9B8A7A" }}>Discount</span>
                  <span className="font-semibold" style={{ color: "var(--gold)" }}>-{formatPrice(savings)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#9B8A7A" }}>Shipping</span>
                  <span style={{ color: shipping === 0 ? "green" : "var(--charcoal)" }}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                {total < 999 && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(184,138,59,0.08)", color: "var(--gold-dark)" }}>
                    Add {formatPrice(999 - total)} more to get free shipping!
                  </p>
                )}
              </div>

              <div
                className="flex justify-between py-4 border-t font-bold"
                style={{ borderColor: "var(--border)" }}
              >
                <span style={{ color: "var(--charcoal)" }}>Total</span>
                <span className="text-lg" style={{ color: "var(--burgundy)" }}>{formatPrice(total + shipping)}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white mt-4 transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "var(--burgundy)" }}
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <Link
                href="/shop"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm mt-3 transition-colors hover:bg-ivory"
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
