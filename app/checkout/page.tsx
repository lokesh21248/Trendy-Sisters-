"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
import { getSafeImageUrl } from "@/lib/image-utils"
import { ArrowLeft, CreditCard, MapPin, Truck, ShieldCheck, CheckCircle2 } from "lucide-react"

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p)
}

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart()
  const { userId } = useAuth()
  const [step, setStep] = useState<"address" | "payment" | "success">("address")
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string>("")
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    title: string
    discount: number
    description: string
    freeShipping?: boolean
  } | null>(null)

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
  const couponDiscount = appliedCoupon?.freeShipping ? 0 : (appliedCoupon?.discount || 0)
  const shipping = appliedCoupon?.freeShipping ? 0 : (total >= 999 ? 0 : 99)
  const finalTotal = Math.max(0, total - couponDiscount + shipping)

  const handlePlaceOrder = async () => {
    if (!userId) {
      alert("Please log in to place an order.")
      return
    }
    setLoading(true)
    
    try {
      const supabase = createClient()
      
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          status: "pending",
          subtotal,
          discount: savings,
          shipping,
          total: finalTotal,
          payment_status: "pending",
          payment_method: "cash_on_delivery" // Hardcoded for now based on selection
        } as any)
        .select("id")
        .single()

      if (orderError) throw orderError

      // 2. Create Order Items
      const orderItems = items.map(item => ({
        order_id: (order as any).id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products?.price || 0,
        mrp: item.products?.mrp || 0
      }))

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems as any)

      if (itemsError) throw itemsError

      setOrderId((order as any).id)
      await clearCart()
      setStep("success")
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (itemCount === 0 && step !== "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-ivory">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Your cart is empty</h2>
          <Link href="/shop" className="btn-primary inline-flex">Return to Shop</Link>
        </div>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-ivory">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-[var(--border)] shadow-lg max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal mb-3">Order Confirmed!</h1>
          <p className="text-sm text-[#9B8A7A] mb-8">
            Thank you for shopping with Trendy Sisters. Your order <span className="font-mono text-charcoal font-semibold">{orderId ? orderId.split('-')[0].toUpperCase() : `ORD-${Math.floor(Math.random()*1000000)}`}</span> has been placed successfully.
          </p>
          <div className="space-y-3">
            <Link href="/account/orders" className="btn-primary w-full block py-3.5">
              View Order Details
            </Link>
            <Link href="/" className="block py-3.5 text-sm font-semibold text-charcoal border border-[var(--border)] rounded-xl hover:bg-ivory transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-8">
      {/* Checkout Header */}
      <div className="bg-white border-b border-[var(--border)] py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-burgundy transition-colors">
            <ArrowLeft size={16} /> Back to Cart
          </Link>
          <div className="font-serif font-bold text-xl text-burgundy">Trendy Sisters</div>
          <div className="flex items-center gap-1 text-xs text-[#9B8A7A]">
            <ShieldCheck size={14} className="text-green-600" /> 100% Secure
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Checkout Area */}
          <div className="flex-1 lg:max-w-2xl">
            {/* Steps Indicator */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "address" ? "bg-burgundy text-white" : "bg-green-600 text-white"}`}>
                  {step === "payment" ? <CheckCircle2 size={14} /> : "1"}
                </div>
                <span className={`text-sm font-bold ${step === "address" ? "text-charcoal" : "text-green-600"}`}>Shipping</span>
              </div>
              <div className="flex-1 h-px bg-[var(--border)]" />
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "payment" ? "bg-burgundy text-white" : "bg-ivory-dark text-[#9B8A7A]"}`}>
                  2
                </div>
                <span className={`text-sm font-bold ${step === "payment" ? "text-charcoal" : "text-[#9B8A7A]"}`}>Payment</span>
              </div>
            </div>

            {step === "address" && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[var(--border)] shadow-sm animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-burgundy" /> Shipping Address
                </h2>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep("payment"); }}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">First Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors" placeholder="e.g. Priya" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">Last Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors" placeholder="e.g. Sharma" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">Phone Number</label>
                    <input type="tel" required className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors" placeholder="+91" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">Address</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors mb-2" placeholder="House/Flat No., Building Name" />
                    <input type="text" className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors" placeholder="Road Name, Area, Colony" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">City</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">PIN Code</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors" />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full py-4 mt-6 text-sm">
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[var(--border)] shadow-sm animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-burgundy" /> Payment Method
                </h2>

                <div className="space-y-3 mb-8">
                  {/* Fake Payment Options */}
                  {["UPI (Google Pay, PhonePe)", "Credit / Debit Card", "Net Banking", "Cash on Delivery"].map((method, idx) => (
                    <label key={method} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${idx === 3 ? "border-burgundy bg-burgundy/5" : "border-[var(--border)] hover:bg-ivory"}`}>
                      <input type="radio" name="payment" className="w-4 h-4 text-burgundy focus:ring-burgundy" defaultChecked={idx === 3} />
                      <span className="font-semibold text-sm text-charcoal">{method}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep("address")} className="px-6 py-4 rounded-xl font-bold text-sm text-charcoal border border-[var(--border)] hover:bg-ivory transition-colors">
                    Back
                  </button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 btn-primary py-4 text-sm flex justify-center items-center gap-2"
                  >
                    {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Place Order • " + formatPrice(finalTotal)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-[400px]">
            <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm sticky top-24">
              <h3 className="font-serif text-lg font-bold text-charcoal mb-5">Order Summary</h3>
              
              {/* Small item list */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map(item => {
                  const p = item.products
                  const img = p?.product_images?.[0]?.image_url
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-ivory-dark flex-shrink-0">
                        {img && <Image src={getSafeImageUrl(img)} alt="" fill className="object-cover" sizes="64px" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-charcoal line-clamp-2 mb-1">{p?.name}</p>
                        <p className="text-xs text-[#9B8A7A]">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-burgundy mt-1">{formatPrice(p?.price || 0)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-[var(--border)] mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9B8A7A]">Subtotal ({itemCount} items)</span>
                  <span className="text-charcoal font-medium">{formatPrice(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9B8A7A]">Product Discount</span>
                    <span className="text-gold font-bold">-{formatPrice(savings)}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm animate-in fade-in">
                    <span className="text-green-700 font-medium">Coupon ({appliedCoupon.code})</span>
                    <span className="text-green-700 font-bold">
                      {appliedCoupon.freeShipping ? "FREE SHIPPING" : `-${formatPrice(couponDiscount)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#9B8A7A]">Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : "text-charcoal"}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-[var(--border)]">
                <div>
                  <span className="block text-sm font-bold text-charcoal">Total Amount</span>
                  <span className="text-[10px] text-[#9B8A7A]">Inclusive of all taxes</span>
                </div>
                <span className="text-xl font-serif font-bold text-burgundy">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
