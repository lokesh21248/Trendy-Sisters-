"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Check,
  AlertCircle,
} from "lucide-react"

interface SavedPayment {
  id: string
  type: "upi" | "card"
  title: string
  identifier: string
  expiry?: string
  isDefault: boolean
}

const DEFAULT_METHODS: SavedPayment[] = [
  {
    id: "pay_1",
    type: "upi",
    title: "Google Pay / UPI",
    identifier: "user@okhdfcbank",
    isDefault: true,
  },
  {
    id: "pay_2",
    type: "card",
    title: "HDFC Bank Regalia Credit Card",
    identifier: "•••• •••• •••• 4281",
    expiry: "09/28",
    isDefault: false,
  },
]

export default function PaymentsPage() {
  const [methods, setMethods] = useState<SavedPayment[]>(DEFAULT_METHODS)
  const [showAddModal, setShowAddModal] = useState<"upi" | "card" | null>(null)
  const [upiId, setUpiId] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  function handleAddUpi(e: React.FormEvent) {
    e.preventDefault()
    if (!upiId.includes("@")) {
      setMessage("Please enter a valid UPI ID (e.g. yourname@okhdfcbank or yourname@paytm)")
      return
    }

    const newMethod: SavedPayment = {
      id: `pay_${Date.now()}`,
      type: "upi",
      title: "Saved UPI Handle",
      identifier: upiId.trim().toLowerCase(),
      isDefault: methods.length === 0,
    }

    setMethods([...methods, newMethod])
    setUpiId("")
    setShowAddModal(null)
    setMessage("UPI ID added successfully.")
    setTimeout(() => setMessage(null), 3000)
  }

  function handleAddCard(e: React.FormEvent) {
    e.preventDefault()
    const cleanNum = cardNumber.replace(/\D/g, "")
    if (cleanNum.length < 15) {
      setMessage("Please enter a valid 16-digit card number.")
      return
    }

    const newMethod: SavedPayment = {
      id: `pay_${Date.now()}`,
      type: "card",
      title: cardHolder || "Saved Debit/Credit Card",
      identifier: `•••• •••• •••• ${cleanNum.slice(-4)}`,
      expiry: cardExpiry || "12/28",
      isDefault: methods.length === 0,
    }

    setMethods([...methods, newMethod])
    setCardNumber("")
    setCardHolder("")
    setCardExpiry("")
    setShowAddModal(null)
    setMessage("Payment card saved according to RBI tokenization guidelines.")
    setTimeout(() => setMessage(null), 3000)
  }

  function handleSetDefault(id: string) {
    setMethods(
      methods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    )
  }

  function handleDelete(id: string) {
    setMethods(methods.filter((m) => m.id !== id))
  }

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-12">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="p-2 -ml-2 rounded-full hover:bg-ivory-dark transition-colors"
              aria-label="Back to account"
            >
              <ArrowLeft size={20} className="text-charcoal" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal">Payment Methods</h1>
              <p className="text-xs text-[#9B8A7A]">Manage saved UPI accounts, credit/debit cards, and payment options</p>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check size={16} />
            {message}
          </div>
        )}

        {/* Saved Methods List */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-charcoal">Saved Payment Options</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal("upi")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-burgundy bg-burgundy/10 hover:bg-burgundy/15 transition-colors"
              >
                <Plus size={14} />
                Add UPI
              </button>
              <button
                onClick={() => setShowAddModal("card")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-burgundy bg-burgundy/10 hover:bg-burgundy/15 transition-colors"
              >
                <Plus size={14} />
                Add Card
              </button>
            </div>
          </div>

          {/* Add UPI Form */}
          {showAddModal === "upi" && (
            <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-charcoal flex items-center gap-2">
                  <Smartphone size={16} className="text-burgundy" /> Add New UPI ID
                </h3>
                <button
                  onClick={() => setShowAddModal(null)}
                  className="text-xs text-[#9B8A7A] hover:text-charcoal"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleAddUpi} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Virtual Payment Address (VPA) / UPI ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mobile@okhdfcbank or name@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                  />
                  <p className="text-[11px] text-[#9B8A7A] mt-1">
                    A test mandate request of ₹1 (auto-refunded) may be sent to verify account ownership.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-burgundy hover:bg-burgundy-light transition-colors"
                >
                  Verify & Save UPI
                </button>
              </form>
            </div>
          )}

          {/* Add Card Form */}
          {showAddModal === "card" && (
            <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-charcoal flex items-center gap-2">
                  <CreditCard size={16} className="text-burgundy" /> Save Debit / Credit Card
                </h3>
                <button
                  onClick={() => setShowAddModal(null)}
                  className="text-xs text-[#9B8A7A] hover:text-charcoal"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Name on Card</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRIYA SHARMA"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">16-Digit Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Expiry Date (MM/YY)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="08/29"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm outline-none focus:border-burgundy transition-colors bg-ivory/20"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#9B8A7A]">
                  <Lock size={12} className="text-emerald-600" />
                  Secured with RBI Compliant Network Tokenization. Card CVV is never saved.
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-burgundy hover:bg-burgundy-light transition-colors"
                >
                  Save Card
                </button>
              </form>
            </div>
          )}

          {methods.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-[var(--border)] shadow-sm">
              <CreditCard size={32} className="text-burgundy opacity-40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-charcoal">No saved payment methods yet</p>
              <p className="text-xs text-[#9B8A7A] mt-1">Add a UPI ID or card for instant 1-tap checkout</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {methods.map((m) => (
                <div
                  key={m.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    m.isDefault ? "border-burgundy shadow-sm ring-1 ring-burgundy/20" : "border-[var(--border)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-burgundy/10 text-burgundy">
                          {m.type === "upi" ? <Smartphone size={16} /> : <CreditCard size={16} />}
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm text-charcoal">{m.title}</h4>
                          <span className="text-[10px] font-bold text-[#9B8A7A] uppercase">{m.type}</span>
                        </div>
                      </div>
                      {m.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-burgundy/10 text-burgundy">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="font-mono text-sm text-charcoal font-medium mt-3">
                      {m.identifier}
                    </p>
                    {m.expiry && (
                      <p className="text-xs text-[#9B8A7A] mt-1">Expires: {m.expiry}</p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                    {!m.isDefault && (
                      <button
                        onClick={() => handleSetDefault(m.id)}
                        className="text-xs font-semibold text-[#9B8A7A] hover:text-charcoal"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Other supported checkout methods */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm mb-8 space-y-4">
          <h3 className="font-serif text-base font-bold text-charcoal">
            Payment Options Available at Checkout
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-ivory/40 border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-charcoal">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Cash on Delivery (COD)
              </div>
              <p className="text-[11px] text-[#9B8A7A] leading-relaxed">
                Pay with cash or scan QR upon physical parcel delivery at your doorstep.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ivory/40 border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-charcoal">
                <CheckCircle2 size={14} className="text-emerald-600" />
                All Major UPI Apps
              </div>
              <p className="text-[11px] text-[#9B8A7A] leading-relaxed">
                Pay with PhonePe, Google Pay, Paytm, BHIM, or WhatsApp Pay.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ivory/40 border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-charcoal">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Net Banking & EMI
              </div>
              <p className="text-[11px] text-[#9B8A7A] leading-relaxed">
                Supported across 50+ Indian commercial banks and cardless EMI providers.
              </p>
            </div>
          </div>
        </div>

        {/* Security & RBI Seal */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--border)] flex items-start gap-3.5">
          <ShieldCheck size={24} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#9B8A7A] leading-relaxed">
            <strong className="text-charcoal block mb-0.5">Bank-Grade 256-Bit SSL Security</strong>
            Trendy Sisters strictly adheres to Reserve Bank of India (RBI) tokenization directives. We never store raw card numbers, PINs, or CVV passwords on our servers. All transactions are processed through certified PCI-DSS Level 1 payment gateways.
          </div>
        </div>
      </div>
    </div>
  )
}
