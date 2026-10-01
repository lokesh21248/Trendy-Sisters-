"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { useAuth, useUser } from "@clerk/nextjs"
import { getSafeImageUrl } from "@/lib/image-utils"
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Banknote,
  Smartphone,
  Building,
  User,
  Phone,
  Mail,
  Home,
  FileText,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react"
import { AdminOrder } from "@/types/admin"

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(p)
}

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart()
  const { userId, isLoaded } = useAuth()
  const { user } = useUser()

  const [step, setStep] = useState<"address" | "payment" | "success">("address")
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string>("")
  const [placedOrder, setPlacedOrder] = useState<AdminOrder | null>(null)
  // Capture the final total BEFORE cart is cleared, so the success screen always shows the correct amount
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0)

  useEffect(() => {
    if (isLoaded && !userId && step !== "success") {
      window.location.href = "/auth/login?redirect_url=/checkout"
    }
  }, [isLoaded, userId, step])

  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    houseFlat: "",
    street: "",
    city: "",
    state: "Karnataka",
    pincode: "",
    notes: "",
  })

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash on Delivery" | "UPI" | "Card" | "Net Banking"
  >("Cash on Delivery")

  // Applied Coupon from /cart
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    title: string
    discount: number
    description: string
    freeShipping?: boolean
  } | null>(null)

  // Auto-fill from user session if available
  useEffect(() => {
    if (user) {
      let phoneFromStorage = ""
      try {
        const storedProfile = localStorage.getItem(`ts_profile_${user.id}`)
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile)
          if (parsed?.phone) phoneFromStorage = parsed.phone
        }
      } catch {}

      const userPhone =
        user.primaryPhoneNumber?.phoneNumber ||
        (user.unsafeMetadata?.phone as string) ||
        phoneFromStorage ||
        ""

      const userFirstName =
        user.firstName ||
        (user.unsafeMetadata?.firstName as string) ||
        (user.unsafeMetadata?.fullName as string)?.split(" ")[0] ||
        ""
      const userLastName =
        user.lastName ||
        (user.unsafeMetadata?.lastName as string) ||
        (user.unsafeMetadata?.fullName as string)?.split(" ").slice(1).join(" ") ||
        ""

      setShippingForm((prev) => ({
        ...prev,
        firstName: prev.firstName || userFirstName,
        lastName: prev.lastName || userLastName,
        email:
          prev.email ||
          user.primaryEmailAddress?.emailAddress ||
          "",
        phone: prev.phone || userPhone.replace(/^\+91/, ""),
      }))
    }
  }, [user])

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

  const subtotal = items.reduce(
    (sum, item) => sum + (item.products?.mrp || item.products?.price || 0) * item.quantity,
    0
  )
  const savings = Math.max(0, subtotal - total)
  const couponDiscount = appliedCoupon?.freeShipping ? 0 : appliedCoupon?.discount || 0
  const shipping = appliedCoupon?.freeShipping ? 0 : total >= 999 ? 0 : 99
  const finalTotal = Math.max(0, total - couponDiscount + shipping)

  // Form input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setShippingForm((prev) => ({ ...prev, [name]: value }))
  }

  // Address Submit Validation
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!shippingForm.firstName.trim()) {
      alert("Please enter your first name.")
      return
    }
    const cleanPhone = shippingForm.phone.replace(/\D/g, "")
    if (!cleanPhone || cleanPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number for delivery updates.")
      return
    }
    if (!shippingForm.houseFlat.trim()) {
      alert("Please enter your House/Flat or Building name.")
      return
    }
    if (!shippingForm.city.trim()) {
      alert("Please enter your City.")
      return
    }
    if (!shippingForm.pincode.trim() || shippingForm.pincode.replace(/\D/g, "").length < 6) {
      alert("Please enter a valid 6-digit postal PIN code.")
      return
    }

    setStep("payment")
  }

  // Place Order Action (Direct to Admin Manage Orders + Supabase)
  const handlePlaceOrder = async () => {
    setLoading(true)

    try {
      const isCOD = paymentMethod === "Cash on Delivery"
      const customerFullName = `${shippingForm.firstName} ${shippingForm.lastName}`.trim()
      const effectiveEmail =
        shippingForm.email.trim() ||
        user?.primaryEmailAddress?.emailAddress ||
        "customer@trendysisters.com"
      const effectiveUserId = userId || `guest_${Date.now()}`

      const payload = {
        user_id: effectiveUserId,
        customer_name: customerFullName,
        customer_email: effectiveEmail,
        customer_phone: shippingForm.phone.trim(),
        address: {
          full_name: customerFullName,
          phone: shippingForm.phone.trim(),
          house_flat: shippingForm.houseFlat.trim(),
          street: shippingForm.street.trim() || "",
          city: shippingForm.city.trim(),
          state: shippingForm.state.trim() || "India",
          pincode: shippingForm.pincode.trim(),
        },
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.products?.name || "Designer Saree",
          product_image:
            item.products?.product_images?.find((x) => x.is_primary)?.image_url ||
            item.products?.product_images?.[0]?.image_url ||
            "",
          quantity: item.quantity,
          price: item.products?.price || 0,
          mrp: item.products?.mrp || item.products?.price || 0,
        })),
        subtotal,
        discount: savings + couponDiscount,
        shipping,
        total: finalTotal,
        payment_method: paymentMethod,
        payment_status: "pending",
        notes: appliedCoupon
          ? `Coupon Applied: ${appliedCoupon.code} (-₹${couponDiscount}). ${
              shippingForm.notes ? `Note: ${shippingForm.notes}` : ""
            }`
          : shippingForm.notes || null,
      }

      // 1. Post to Server API (/api/admin/orders)
      let finalAdminOrder: AdminOrder | null = null
      try {
        const res = await fetch("/api/admin/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()
        if (result.success && result.order) {
          finalAdminOrder = result.order
        }
      } catch (apiErr) {
        console.warn("[Checkout] Error posting to /api/admin/orders:", apiErr)
      }

      // Fallback if API returned null
      if (!finalAdminOrder) {
        const randId = Math.floor(100000 + Math.random() * 900000)
        finalAdminOrder = {
          id: `ord-${Date.now()}`,
          order_number: isCOD ? `TS-COD-${randId}` : `TS-2026-${randId}`,
          user_id: effectiveUserId,
          customer_name: customerFullName,
          customer_email: effectiveEmail,
          customer_phone: shippingForm.phone.trim(),
          address: payload.address,
          status: "pending",
          subtotal,
          discount: savings + couponDiscount,
          shipping,
          total: finalTotal,
          payment_method: paymentMethod,
          payment_status: "pending",
          notes: payload.notes,
          order_items: payload.items.map((it, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            order_id: `ord-${Date.now()}`,
            product_id: it.product_id,
            product_name: it.product_name,
            product_image: it.product_image,
            quantity: it.quantity,
            price: it.price,
            mrp: it.mrp,
          })),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }

      // 2. Sync to LocalStorage for Admin Manage Orders Section Immediately
      if (typeof window !== "undefined") {
        try {
          const currentStorage = localStorage.getItem("trendy_sisters_admin_orders_v1")
          let currentOrders: AdminOrder[] = currentStorage ? JSON.parse(currentStorage) : []
          const updated = [
            finalAdminOrder,
            ...currentOrders.filter(
              (o) =>
                o.id !== finalAdminOrder?.id &&
                o.order_number !== finalAdminOrder?.order_number
            ),
          ]
          localStorage.setItem(
            "trendy_sisters_admin_orders_v1",
            JSON.stringify(updated)
          )

          // Save to customer order history
          const custStorage = localStorage.getItem("trendy_sisters_customer_orders")
          let custOrders = custStorage ? JSON.parse(custStorage) : []
          localStorage.setItem(
            "trendy_sisters_customer_orders",
            JSON.stringify([finalAdminOrder, ...custOrders])
          )

          // Dispatch event so Admin section updates in real time
          window.dispatchEvent(
            new CustomEvent("trendy_order_placed", { detail: finalAdminOrder })
          )
        } catch (storageErr) {
          console.warn("Storage sync error:", storageErr)
        }
      }

      // 3. Capture the total BEFORE clearing cart (cart total becomes 0 after clearCart)
      const totalToConfirm = Number(finalAdminOrder.total) > 0
        ? Number(finalAdminOrder.total)
        : finalTotal
      setConfirmedTotal(totalToConfirm)
      setOrderId(finalAdminOrder.order_number)
      setPlacedOrder(finalAdminOrder)
      try {
        sessionStorage.removeItem("trendy_applied_coupon")
      } catch {}
      await clearCart()

      setStep("success")
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Empty cart view
  if (itemCount === 0 && step !== "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-ivory">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Your cart is empty</h2>
          <Link href="/shop" className="btn-primary inline-flex">
            Return to Shop
          </Link>
        </div>
      </div>
    )
  }

  // Order Confirmed / Success Screen
  if (step === "success") {
    const isCOD = placedOrder?.payment_method === "Cash on Delivery"
    const orderRef = orderId || placedOrder?.order_number || "TS-2026-CONFIRMED"
    const customerOrderHref = placedOrder?.id
      ? `/account/orders/${placedOrder.id}`
      : "/account/orders"
    const customerTrackHref = placedOrder?.id
      ? `/account/orders/${placedOrder.id}/tracking`
      : "/account/orders"

    return (
      <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[var(--border)] shadow-lg text-center">
          {/* Success Check Badge */}
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 size={44} className="text-emerald-700" />
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
            {isCOD ? "Cash on Delivery Confirmed" : "Order Placed Successfully"}
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-2">
            Thank you for your order!
          </h1>

          <p className="text-sm text-[#9B8A7A] mb-6">
            Your booking/order details have been registered successfully.
          </p>

          {/* Order Details Card */}
          <div className="bg-[var(--ivory)] rounded-2xl p-5 border border-[var(--border)] text-left mb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
              <div>
                <span className="text-xs text-[#9B8A7A] block font-medium uppercase tracking-wider">
                  Order Reference
                </span>
                <span className="font-mono font-bold text-base text-[var(--burgundy)]">
                  {orderRef}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#9B8A7A] block font-medium uppercase tracking-wider">
                  Payment Method
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-xs text-charcoal">
                  <Banknote size={14} className="text-[#B88A3B]" />
                  {placedOrder?.payment_method || (isCOD ? "Cash on Delivery" : "UPI")}
                </span>
              </div>
            </div>

            {/* COD Instruction Banner — Prominent badge with actual amount */}
            {isCOD && (
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50 overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-400/20 border-b border-amber-300">
                  <Banknote size={16} className="text-amber-700 shrink-0" />
                  <span className="font-bold text-amber-900 text-xs uppercase tracking-wider">Cash on Delivery</span>
                  <span className="ml-auto inline-block px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase">
                    COD Confirmed
                  </span>
                </div>
                <div className="p-3.5 text-xs text-amber-900 space-y-1">
                  <p className="font-semibold">✅ You have booked Cash on Delivery</p>
                  <p>
                    Please keep{" "}
                    <span className="font-bold text-[#651F35] text-sm">
                      {formatPrice(confirmedTotal > 0 ? confirmedTotal : (placedOrder?.total ?? 0))}
                    </span>{" "}
                    ready to pay at the time of delivery.
                  </p>
                </div>
              </div>
            )}

            {/* Delivering To */}
            {placedOrder?.address && (
              <div className="text-xs text-charcoal space-y-1.5 pt-1">
                <span className="font-semibold text-[#9B8A7A] block uppercase tracking-wider text-[11px]">
                  Delivering To:
                </span>
                <div className="font-bold text-sm text-[#25201D]">
                  {placedOrder.customer_name} • {placedOrder.customer_phone}
                </div>
                <div className="text-[#6B5E51]">
                  {placedOrder.address.house_flat}
                  {placedOrder.address.street ? `, ${placedOrder.address.street}` : ""}
                </div>
                <div className="text-[#6B5E51]">
                  {placedOrder.address.city}, {placedOrder.address.state} -{" "}
                  <span className="font-semibold text-charcoal">
                    {placedOrder.address.pincode}
                  </span>
                </div>
              </div>
            )}

            {/* Items Ordered */}
            {placedOrder?.order_items && placedOrder.order_items.length > 0 && (
              <div className="pt-3 border-t border-[var(--border)]">
                <span className="font-semibold text-[#9B8A7A] block uppercase tracking-wider text-[11px] mb-2.5">
                  Items Ordered ({placedOrder.order_items.length}):
                </span>
                <div className="space-y-2.5">
                  {placedOrder.order_items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between text-xs gap-3 p-2.5 rounded-xl bg-white border border-[var(--border)]/70 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {it.product_image ? (
                          <img
                            src={it.product_image}
                            alt={it.product_name}
                            className="w-10 h-12 object-cover rounded-md border border-[var(--border)] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-12 rounded-md bg-ivory-dark border border-[var(--border)] flex items-center justify-center shrink-0 text-[10px] text-[#9B8A7A]">
                            Saree
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-charcoal font-semibold text-xs">
                            {it.product_name}
                          </p>
                          <p className="text-[#9B8A7A] text-[11px] mt-0.5">
                            Qty: <span className="font-medium text-charcoal">{it.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-charcoal shrink-0 text-sm">
                        {formatPrice(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Amount — Always shown, outside items block so it never gets hidden */}
            <div className="pt-3.5 border-t border-dashed border-[var(--border)]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-[#6B5E51] text-sm block">Total Amount</span>
                  {isCOD && (
                    <span className="text-[11px] text-amber-700 font-medium">
                      Pay at the time of delivery • Cash on Delivery
                    </span>
                  )}
                </div>
                <span className="font-bold text-lg text-[var(--burgundy)]">
                  {formatPrice(confirmedTotal > 0 ? confirmedTotal : (placedOrder?.total ?? 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Action CTAs - Replaces all admin navigation */}
          <div className="space-y-3">
            <Link
              href={customerOrderHref}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-center text-sm font-semibold shadow-md transition-all hover:shadow-lg"
            >
              <span>View My Order</span>
              <ArrowRight size={16} />
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href={customerTrackHref}
                className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-center text-burgundy bg-burgundy/5 border border-burgundy/20 rounded-xl hover:bg-burgundy/10 transition-colors"
              >
                <Truck size={15} />
                <span>Track Order →</span>
              </Link>
              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-center text-charcoal border border-[var(--border)] rounded-xl hover:bg-ivory transition-colors"
              >
                <ShoppingBag size={15} />
                <span>Continue Shopping</span>
              </Link>
            </div>
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
          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-burgundy transition-colors"
          >
            <ArrowLeft size={16} /> Back to Cart
          </Link>
          <div className="font-serif font-bold text-xl text-burgundy">Trendy Sisters</div>
          <div className="flex items-center gap-1 text-xs text-[#9B8A7A]">
            <ShieldCheck size={14} className="text-emerald-700" /> 100% Verified
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Checkout Area */}
          <div className="flex-1 lg:max-w-2xl">
            {/* Steps Indicator */}
            <div className="flex items-center gap-4 mb-8">
              <div
                onClick={() => setStep("address")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === "address" ? "bg-burgundy text-white" : "bg-emerald-700 text-white"
                  }`}
                >
                  {step === "payment" ? <CheckCircle2 size={14} /> : "1"}
                </div>
                <span
                  className={`text-sm font-bold ${
                    step === "address" ? "text-charcoal" : "text-emerald-700"
                  }`}
                >
                  Shipping Address
                </span>
              </div>
              <div className="flex-1 h-px bg-[var(--border)]" />
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === "payment"
                      ? "bg-burgundy text-white"
                      : "bg-ivory-dark text-[#9B8A7A]"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-sm font-bold ${
                    step === "payment" ? "text-charcoal" : "text-[#9B8A7A]"
                  }`}
                >
                  Payment & COD
                </span>
              </div>
            </div>

            {/* STEP 1: Shipping Address Form */}
            {step === "address" && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[var(--border)] shadow-sm animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-burgundy" /> Delivery Destination
                </h2>

                <form className="space-y-4" onSubmit={handleAddressSubmit}>
                  {/* Name Fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={shippingForm.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="e.g. Priya"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingForm.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="e.g. Sharma"
                      />
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">
                        Mobile Number (For Delivery Updates) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={shippingForm.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="+91 98401 22849"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingForm.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="priya@example.com"
                      />
                    </div>
                  </div>

                  {/* Street & House Address */}
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">
                      House / Flat / Building Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="houseFlat"
                      required
                      value={shippingForm.houseFlat}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors mb-2"
                      placeholder="e.g. Flat 302, Sai Residency"
                    />
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">
                      Street / Area / Landmark
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={shippingForm.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                      placeholder="e.g. 5th Main Road, Indiranagar, Near BDA Complex"
                    />
                  </div>

                  {/* City, State, PIN */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={shippingForm.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="e.g. Bengaluru"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingForm.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="Karnataka"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        maxLength={6}
                        value={shippingForm.pincode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                        placeholder="560038"
                      />
                    </div>
                  </div>

                  {/* Notes / Special Instructions */}
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">
                      Delivery Notes / Packing Instructions (Optional)
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={shippingForm.notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] bg-ivory focus:border-burgundy outline-none transition-colors"
                      placeholder="e.g. Please call before delivery, gift wrap with zari care instructions."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-4 mt-6 text-sm font-semibold cursor-pointer shadow-md"
                  >
                    Continue to Payment & COD Selection →
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Payment Method Form */}
            {step === "payment" && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[var(--border)] shadow-sm animate-fade-in">
                <h2 className="font-serif text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-burgundy" /> Choose Payment Option
                </h2>

                <div className="space-y-3 mb-8">
                  {/* Option 1: CASH ON DELIVERY (Default & Highlighted) */}
                  <label
                    onClick={() => setPaymentMethod("Cash on Delivery")}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "Cash on Delivery"
                        ? "border-[var(--burgundy)] bg-[#651F35]/5 shadow-sm"
                        : "border-[var(--border)] hover:bg-ivory"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "Cash on Delivery"}
                      onChange={() => setPaymentMethod("Cash on Delivery")}
                      className="w-4 h-4 text-burgundy focus:ring-burgundy mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                          <Banknote size={18} className="text-emerald-700" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-[#6B5E51] mt-1">
                        Pay with cash or UPI directly to our delivery courier when your saree package arrives.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: UPI */}
                  <label
                    onClick={() => setPaymentMethod("UPI")}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "UPI"
                        ? "border-[var(--burgundy)] bg-[#651F35]/5 shadow-sm"
                        : "border-[var(--border)] hover:bg-ivory"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "UPI"}
                      onChange={() => setPaymentMethod("UPI")}
                      className="w-4 h-4 text-burgundy focus:ring-burgundy mt-1"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                        <Smartphone size={18} className="text-[#B88A3B]" />
                        UPI (Google Pay, PhonePe, Paytm, BHIM)
                      </span>
                      <p className="text-xs text-[#9B8A7A] mt-1">
                        Instant payment via UPI QR code or VPA ID.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Cards */}
                  <label
                    onClick={() => setPaymentMethod("Card")}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "Card"
                        ? "border-[var(--burgundy)] bg-[#651F35]/5 shadow-sm"
                        : "border-[var(--border)] hover:bg-ivory"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "Card"}
                      onChange={() => setPaymentMethod("Card")}
                      className="w-4 h-4 text-burgundy focus:ring-burgundy mt-1"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                        <CreditCard size={18} className="text-[#651F35]" />
                        Credit / Debit Card (Visa, Mastercard, RuPay)
                      </span>
                      <p className="text-xs text-[#9B8A7A] mt-1">
                        Secured 256-bit SSL encrypted card transaction.
                      </p>
                    </div>
                  </label>

                  {/* Option 4: Net Banking */}
                  <label
                    onClick={() => setPaymentMethod("Net Banking")}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "Net Banking"
                        ? "border-[var(--burgundy)] bg-[#651F35]/5 shadow-sm"
                        : "border-[var(--border)] hover:bg-ivory"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "Net Banking"}
                      onChange={() => setPaymentMethod("Net Banking")}
                      className="w-4 h-4 text-burgundy focus:ring-burgundy mt-1"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                        <Building size={18} className="text-[#6B5E51]" />
                        Net Banking (All Major Indian Banks)
                      </span>
                      <p className="text-xs text-[#9B8A7A] mt-1">
                        HDFC, ICICI, SBI, Axis, Kotak, and 50+ banks.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Delivery Address Preview */}
                <div className="bg-[var(--ivory)] rounded-2xl p-4 border border-[var(--border)] mb-6 text-xs text-[#25201D]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#651F35] uppercase tracking-wider text-[11px]">
                      Delivering to:
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep("address")}
                      className="text-[11px] font-semibold text-[var(--burgundy)] underline"
                    >
                      Change Address
                    </button>
                  </div>
                  <div className="font-bold">
                    {shippingForm.firstName} {shippingForm.lastName} ({shippingForm.phone})
                  </div>
                  <div className="text-[#6B5E51]">
                    {shippingForm.houseFlat}, {shippingForm.street ? `${shippingForm.street}, ` : ""}
                    {shippingForm.city}, {shippingForm.state} - {shippingForm.pincode}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep("address")}
                    className="px-6 py-4 rounded-xl font-bold text-sm text-charcoal border border-[var(--border)] hover:bg-ivory transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 btn-primary py-4 text-sm font-semibold flex justify-center items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Book Order ({paymentMethod === "Cash on Delivery" ? "COD" : paymentMethod}) •{" "}
                        {formatPrice(finalTotal)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-[400px]">
            <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm sticky top-24">
              <h3 className="font-serif text-lg font-bold text-charcoal mb-5">Order Summary</h3>

              {/* Saree Items List */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => {
                  const p = item.products
                  const img =
                    p?.product_images?.find((x) => x.is_primary)?.image_url ||
                    p?.product_images?.[0]?.image_url
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-ivory-dark flex-shrink-0 border border-[var(--border)]">
                        {img && (
                          <Image
                            src={getSafeImageUrl(img)}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-charcoal line-clamp-2 mb-1">
                          {p?.name}
                        </p>
                        <p className="text-xs text-[#9B8A7A]">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-burgundy mt-1">
                          {formatPrice(p?.price || 0)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Financials Calculation */}
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
                    <span className="text-emerald-700 font-medium">
                      Coupon ({appliedCoupon.code})
                    </span>
                    <span className="text-emerald-700 font-bold">
                      {appliedCoupon.freeShipping
                        ? "FREE SHIPPING"
                        : `-${formatPrice(couponDiscount)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#9B8A7A]">Shipping</span>
                  <span className={shipping === 0 ? "text-emerald-700 font-medium" : "text-charcoal"}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              {/* Final Amount Payable */}
              <div className="flex justify-between items-end pt-4 border-t border-[var(--border)]">
                <div>
                  <span className="block text-sm font-bold text-charcoal">Total Amount</span>
                  <span className="text-[10px] text-[#9B8A7A]">
                    {paymentMethod === "Cash on Delivery"
                      ? "Pay in cash on delivery"
                      : "Inclusive of all taxes"}
                  </span>
                </div>
                <span className="text-xl font-serif font-bold text-burgundy">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
