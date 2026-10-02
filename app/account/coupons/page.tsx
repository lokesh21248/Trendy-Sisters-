"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Tag,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  Percent,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

import { getActiveCoupons } from "@/lib/coupon-utils"
import type { Coupon } from "@/types/database"

export default function CouponsPage() {
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const [customCode, setCustomCode] = useState("")
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    getActiveCoupons().then(setAvailableCoupons)
  }, [])

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev))
    }, 2500)
  }

  function handleValidate(e: React.FormEvent) {
    e.preventDefault()
    const clean = customCode.trim().toUpperCase()
    if (!clean) return

    const matched = availableCoupons.find((c) => c.code.toUpperCase() === clean)
    if (matched) {
      const discountText = matched.discount_type === 'percentage' ? `${matched.discount_value}% OFF` : `₹${matched.discount_value} OFF`
      setTestResult({
        success: true,
        message: `Success! ${matched.code} is valid: ${discountText} on orders above ₹${matched.min_order_value}.`,
      })
    } else {
      setTestResult({
        success: false,
        message: `Coupon code "${clean}" is invalid or expired. Check spelling or select an offer below.`,
      })
    }
  }

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-12">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Navigation & Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/account"
            className="p-2 -ml-2 rounded-full hover:bg-ivory-dark transition-colors"
            aria-label="Back to account"
          >
            <ArrowLeft size={20} className="text-charcoal" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal">Coupons & Rewards</h1>
            <p className="text-xs text-[#9B8A7A]">Explore active promotional offers and copy discount voucher codes</p>
          </div>
        </div>

        {/* Code Tester Box */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-charcoal">Have a promotional coupon?</h2>
              <p className="text-xs text-[#9B8A7A]">Check coupon eligibility before checking out</p>
            </div>
          </div>

          <form onSubmit={handleValidate} className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8A7A]" />
              <input
                type="text"
                placeholder="Enter coupon code (e.g. FESTIVE25)"
                value={customCode}
                onChange={(e) => {
                  setCustomCode(e.target.value.toUpperCase())
                  setTestResult(null)
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-mono uppercase outline-none focus:border-burgundy transition-colors bg-ivory/20"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-burgundy hover:bg-burgundy-light transition-colors sm:w-auto"
            >
              Verify Code
            </button>
          </form>

          {testResult && (
            <div
              className={`mt-4 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {testResult.success ? <Check size={16} /> : <Tag size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Available Coupons Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-charcoal">Available Vouchers ({availableCoupons.length})</h2>
            <Link href="/shop" className="text-xs font-semibold text-burgundy hover:underline flex items-center gap-1">
              <ShoppingBag size={14} />
              Shop Now
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-5">
            {availableCoupons.length === 0 && (
                <p className="text-sm text-gray-500">No active coupons available at this time.</p>
            )}
            {availableCoupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code
              const isExpanded = expandedCode === coupon.code

              return (
                <div
                  key={coupon.code}
                  className="relative bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  {/* Decorative Ticket Perforations */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--ivory)] rounded-full border-r border-[var(--border)]" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-[var(--ivory)] rounded-full border-l border-[var(--border)]" />

                  <div className="p-5 lg:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#B88A3B]/15 text-[#B88A3B] mb-1.5">
                          OFFER
                        </span>
                        <h3 className="font-serif font-bold text-base text-charcoal">{coupon.code}</h3>
                      </div>
                      <div className="text-right">
                        <span className="font-serif font-black text-lg text-burgundy">
                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#9B8A7A] leading-relaxed mb-4">{coupon.description || "Special offer"}</p>

                    {/* Code badge with copy action */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-ivory-dark/60 border border-dashed border-[var(--border)] mb-4">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-burgundy" />
                        <span className="font-mono font-bold text-sm tracking-widest text-charcoal">
                          {coupon.code}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-burgundy text-white hover:bg-burgundy-light shadow-sm"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={13} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-[11px] text-[#9B8A7A]">
                      <span>Min Order: <strong className="text-charcoal">₹{coupon.min_order_value}</strong></span>
                      {coupon.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {new Date(coupon.expires_at).toLocaleDateString()}
                          </span>
                      )}
                    </div>

                    {/* T&C Accordion */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[#9B8A7A] space-y-1.5 animate-in fade-in duration-150">
                        <p className="font-semibold text-charcoal text-[11px]">Terms & Conditions:</p>
                        <ul className="list-disc pl-4 space-y-1 text-[11px]">
                          <li>Valid for orders above ₹{coupon.min_order_value}</li>
                          {coupon.max_discount_amount && (
                              <li>Maximum discount capped at ₹{coupon.max_discount_amount}</li>
                          )}
                          <li>Cannot be clubbed with other promotional coupons</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card bottom toggle */}
                  <div className="px-5 py-2.5 bg-ivory/40 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => setExpandedCode(isExpanded ? null : coupon.code)}
                      className="text-[#9B8A7A] hover:text-charcoal font-medium flex items-center gap-1"
                    >
                      {isExpanded ? "Hide Details" : "View Details"}
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    <Link
                      href="/cart"
                      className="text-burgundy font-semibold hover:underline"
                    >
                      Apply in Cart →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-8 p-4 rounded-2xl bg-white border border-[var(--border)] flex items-center gap-3 text-xs text-[#9B8A7A]">
          <ShieldCheck size={20} className="text-burgundy flex-shrink-0" />
          <span>
            Trendy Sisters authentic guarantee: All promotional discounts and coupon codes are automatically verified and redeemed at checkout.
          </span>
        </div>
      </div>
    </div>
  )
}
