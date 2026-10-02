"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/contexts/CartContext"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle2, AlertCircle, Sparkles, X } from "lucide-react"
import { getSafeImageUrl } from "@/lib/image-utils"
import type { CartItemWithProduct } from "@/types"

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p)
}

import { getActiveCoupons, validateCoupon, calculateCouponDiscount } from "@/lib/coupon-utils"
import type { Coupon } from "@/types/database"

export default function CartPage() {
  const { items, itemCount, total, updateQuantity, removeItem, loading } = useCart()

  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discount: number; freeShipping?: boolean} | null>(null)
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: "error" | "success" } | null>(null)
  const [showCouponList, setShowCouponList] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])

  useEffect(() => {
    getActiveCoupons().then(setAvailableCoupons)
  }, [])

  // Restore applied coupon from session
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("trendy_applied_coupon")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.code) {
          setAppliedCoupon(parsed)
        }
      }
    } catch {}
  }, [])

  const subtotal = items.reduce((sum, item) => sum + (item.products?.mrp || 0) * item.quantity, 0)
  const savings = subtotal - total
  const baseShipping = total >= 999 ? 0 : 99

  // Calculate dynamic coupon discount based on current cart total
  let couponDiscount = 0
  let isFreeShipping = false

  if (appliedCoupon) {
    const config = availableCoupons.find((c) => c.code.toUpperCase() === appliedCoupon.code.toUpperCase())
    if (config) {
       couponDiscount = calculateCouponDiscount(config, total)
       // if we had free shipping logic, it would go here (or inside calculateCouponDiscount)
       // for now, we follow db schema which just has percentage or fixed
    }
  }

  const shipping = isFreeShipping ? 0 : baseShipping
  const grandTotal = Math.max(0, total - (isFreeShipping ? 0 : couponDiscount) + shipping)

  const handleApplyCoupon = async (codeToApply?: string) => {
    const cleanCode = (codeToApply || couponInput).trim().toUpperCase()
    if (!cleanCode) {
      setCouponMessage({ text: "Please enter a coupon code.", type: "error" })
      return
    }

    setIsApplying(true)
    
    const result = await validateCoupon(cleanCode, total)
    setIsApplying(false)
    
    if (!result.valid) {
        setCouponMessage({ text: result.error || "Invalid coupon", type: "error" })
        return
    }

    const appliedObj = {
        code: cleanCode,
        discount: result.discount,
        freeShipping: false
    }

    setAppliedCoupon(appliedObj)
    setCouponInput("")
    setCouponMessage({
    text: `Coupon "${cleanCode}" applied! You saved ${formatPrice(result.discount)}.`,
    type: "success",
    })

    try {
    sessionStorage.setItem("trendy_applied_coupon", JSON.stringify(appliedObj))
    } catch {}
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponMessage(null)
    setCouponInput("")
    try {
      sessionStorage.removeItem("trendy_applied_coupon")
    } catch {}
  }

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
          {/* Cart items column */}
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
                      {(product?.fabric_materials?.name || product?.fabric) && (
                        <p className="text-[11px] sm:text-xs mb-2 line-clamp-1" style={{ color: "#9B8A7A" }}>
                          {product.fabric_materials?.name || product.fabric}
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

            {/* Enhanced Coupon Section */}
            <div
              className="p-4 sm:p-5 rounded-2xl w-full min-w-0 box-border bg-white"
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag size={17} style={{ color: "var(--gold)" }} />
                  <span className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>
                    Apply Coupon Code
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCouponList(!showCouponList)}
                  className="text-xs font-semibold hover:underline flex items-center gap-1"
                  style={{ color: "var(--burgundy)" }}
                >
                  <Sparkles size={12} />
                  <span>{showCouponList ? "Hide Offers" : "View Offers"}</span>
                </button>
              </div>

              {appliedCoupon ? (
                <div
                  className="flex items-center justify-between p-3.5 rounded-xl border"
                  style={{ borderColor: "rgba(21,128,61,0.3)", backgroundColor: "rgba(21,128,61,0.06)" }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-green-800 tracking-wide font-mono">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[11px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          SAVED {formatPrice(appliedCoupon.discount)}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-0.5 truncate">{appliedCoupon.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0 ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleApplyCoupon()
                  }}
                  className="relative flex items-center w-full min-w-0"
                >
                  <Tag
                    size={16}
                    className="absolute left-3.5 pointer-events-none"
                    style={{ color: "var(--gold)" }}
                  />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase())
                      if (couponMessage) setCouponMessage(null)
                    }}
                    placeholder="Enter coupon code (e.g. TRENDY10)"
                    className="w-full pl-10 pr-[85px] py-2.5 rounded-xl text-xs sm:text-sm font-medium uppercase placeholder:normal-case placeholder:font-normal outline-none box-border transition-all focus:ring-2 focus:ring-[#651F35]/20"
                    style={{
                      backgroundColor: "var(--ivory-dark)",
                      border: "1px solid var(--border)",
                      color: "var(--charcoal)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!couponInput.trim() || isApplying}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg font-semibold text-xs sm:text-sm text-white shrink-0 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    style={{ backgroundColor: "var(--burgundy)" }}
                  >
                    {isApplying ? "..." : "Apply"}
                  </button>
                </form>
              )}

              {couponMessage && (
                <div
                  className={`mt-2.5 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 ${
                    couponMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {couponMessage.type === "success" ? (
                    <CheckCircle2 size={14} className="shrink-0" />
                  ) : (
                    <AlertCircle size={14} className="shrink-0" />
                  )}
                  <span>{couponMessage.text}</span>
                </div>
              )}

              {/* Quick Offers List */}
              {showCouponList && !appliedCoupon && (
                <div className="mt-3.5 pt-3.5 border-t border-[var(--border)] space-y-2">
                  <p className="text-xs font-semibold text-[#9B8A7A] uppercase tracking-wider mb-2">
                    Available Coupons
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {availableCoupons.length === 0 && (
                        <p className="text-xs text-gray-500">No active coupons available at this time.</p>
                    )}
                    {availableCoupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--ivory)] border border-[var(--border)] gap-2 hover:border-[var(--burgundy)] transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[var(--ivory-dark)] border border-[var(--gold)]/40 text-[var(--burgundy)]">
                              {coupon.code}
                            </span>
                            <span className="text-xs font-semibold text-[var(--charcoal)] truncate">
                              {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[var(--burgundy)] text-white">
                              {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#9B8A7A] mt-0.5">{coupon.description || "Special Offer"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(coupon.code)}
                          className="text-xs font-semibold text-[var(--burgundy)] px-3 py-1 rounded-lg border border-[var(--burgundy)] hover:bg-[var(--burgundy)] hover:text-white transition-all shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order summary column */}
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
                  <span className="shrink min-w-0 break-words" style={{ color: "#9B8A7A" }}>
                    Product Discount
                  </span>
                  <span
                    className="text-right font-semibold shrink-0 max-w-[60%] break-words"
                    style={{ color: "var(--gold)", overflowWrap: "anywhere" }}
                  >
                    -{formatPrice(savings)}
                  </span>
                </div>

                {appliedCoupon && couponDiscount > 0 && !isFreeShipping && (
                  <div className="flex items-baseline justify-between gap-3 text-xs sm:text-sm w-full min-w-0 animate-in fade-in">
                    <span className="shrink min-w-0 break-words flex items-center gap-1.5 text-green-700 font-medium">
                      <Tag size={13} className="shrink-0" />
                      Coupon ({appliedCoupon.code})
                    </span>
                    <span
                      className="text-right font-semibold shrink-0 max-w-[60%] text-green-700 break-words"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex items-baseline justify-between gap-3 text-xs sm:text-sm w-full min-w-0">
                  <span className="shrink min-w-0 break-words" style={{ color: "#9B8A7A" }}>Shipping</span>
                  <span
                    className="text-right font-medium shrink-0 max-w-[60%] break-words"
                    style={{ color: shipping === 0 ? "green" : "var(--charcoal)", overflowWrap: "anywhere" }}
                  >
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>

                {total < 999 && !isFreeShipping && (
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
                  {formatPrice(grandTotal)}
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

