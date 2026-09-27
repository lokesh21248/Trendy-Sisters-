"use client"

import { useState } from "react"
import Link from "next/link"
import {
  MessageCircle, Phone, Mail, MapPin, Clock,
  ChevronDown, Send, CheckCircle2, ShieldCheck, Truck, RefreshCw
} from "lucide-react"

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Order Inquiry",
    message: "",
  })

  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: "How do I track my order status?",
      a: "You can track your order at any time by visiting your Account > My Orders page. Once your saree is dispatched, we also send tracking links directly via SMS and WhatsApp.",
    },
    {
      q: "What is your return & exchange policy?",
      a: "We offer an easy 7-day return and exchange policy from the date of delivery. Items must be unworn, unwashed, and in their original packaging with tags intact. Handloom silk sarees with fall/pico or customized blouses are non-returnable unless damaged.",
    },
    {
      q: "How long does shipping take?",
      a: "Metro cities across India typically receive orders within 3–5 business days. Other regions take 4–7 business days. We provide free standard shipping on all orders above ₹999.",
    },
    {
      q: "Are all Trendy Sisters sarees 100% authentic?",
      a: "Yes! Every single silk, zari, and cotton saree is directly handpicked from master artisans and verified for yarn quality and handloom authenticity.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major UPI apps (Google Pay, PhonePe, Paytm), Credit & Debit cards (Visa, MasterCard, RuPay), NetBanking, and Cash on Delivery (COD) on eligible pin codes.",
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated submission feedback
    setSubmitted(true)
  }

  return (
    <div className="w-full" style={{ backgroundColor: "var(--ivory)" }}>
      {/* Header */}
      <section
        className="py-14 sm:py-20 text-center px-4"
        style={{
          background: "linear-gradient(180deg, var(--ivory-dark) 0%, var(--ivory) 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-3xl mx-auto space-y-3">
          <span
            className="inline-block text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full border"
            style={{
              borderColor: "var(--gold)",
              color: "var(--burgundy)",
              backgroundColor: "rgba(184, 138, 59, 0.1)",
            }}
          >
            We Are Here For You
          </span>
          <h1
            className="font-serif text-3xl sm:text-5xl font-bold tracking-tight"
            style={{ color: "var(--burgundy)" }}
          >
            Customer Care & Support
          </h1>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: "var(--charcoal-light)" }}>
            Have a question about a saree, your order, or shipping? Reach out to our dedicated support
            team anytime.
          </p>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="https://wa.me/916304144691"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-md flex flex-col justify-between group"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "#25D366", color: "white" }}
              >
                <MessageCircle size={20} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>
                WhatsApp Chat
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--charcoal-light)" }}>
                Fastest response for order status & styling help.
              </p>
            </div>
            <span className="text-xs font-bold mt-4" style={{ color: "#25D366" }}>
              +91 63041 44691 →
            </span>
          </a>

          <a
            href="tel:+916304144691"
            className="p-5 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "var(--burgundy)", color: "white" }}
              >
                <Phone size={20} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>
                Direct Phone Call
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--charcoal-light)" }}>
                Speak directly with our store team.
              </p>
            </div>
            <span className="text-xs font-bold mt-4" style={{ color: "var(--burgundy)" }}>
              +91 63041 44691 →
            </span>
          </a>

          <div
            className="p-5 rounded-2xl bg-white border shadow-sm flex flex-col justify-between"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "var(--gold)", color: "white" }}
              >
                <Clock size={20} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>
                Store Hours
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--charcoal-light)" }}>
                Open 24 hours, 7 days a week.
              </p>
            </div>
            <span className="text-xs font-bold mt-4" style={{ color: "var(--gold-dark)" }}>
              Always Open
            </span>
          </div>

          <a
            href="https://maps.google.com/?q=M63R%2BQH8+Kadirinaidu+Palli+Padamatinaidupalle+Andhra+Pradesh+524302+India"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "var(--charcoal)", color: "white" }}
              >
                <MapPin size={20} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>
                Store Location
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--charcoal-light)" }}>
                Kadirinaidu Palli, Padamatinaidupalle, AP 524302
              </p>
            </div>
            <span className="text-xs font-bold mt-4" style={{ color: "var(--burgundy)" }}>
              View on Google Maps →
            </span>
          </a>
        </div>
      </section>

      {/* Main Support Grid: FAQs + Contact Form */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* FAQs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: "var(--burgundy)" }}>
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--charcoal-light)" }}>
                Find instant answers to the most common questions.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={idx}
                    className="border rounded-2xl bg-white overflow-hidden transition-all"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                    >
                      <span className="font-semibold text-sm sm:text-base" style={{ color: "var(--charcoal)" }}>
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className="flex-shrink-0 transition-transform duration-200"
                        style={{
                          color: "var(--burgundy)",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t" style={{ borderColor: "var(--border)", color: "var(--charcoal-light)" }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Quick action buttons */}
            <div className="p-5 rounded-2xl border flex flex-wrap gap-4 items-center justify-between" style={{ backgroundColor: "var(--ivory-dark)", borderColor: "var(--border)" }}>
              <div>
                <h4 className="font-semibold text-sm" style={{ color: "var(--burgundy)" }}>
                  Looking for your order?
                </h4>
                <p className="text-xs" style={{ color: "var(--charcoal-light)" }}>
                  Check status, history, and delivery details anytime.
                </p>
              </div>
              <Link
                href="/account/orders"
                className="px-4 py-2 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--burgundy)" }}
              >
                Track Orders
              </Link>
            </div>
          </div>

          {/* Contact Form (5 cols) */}
          <div className="lg:col-span-5">
            <div
              className="p-6 sm:p-8 rounded-2xl bg-white border shadow-sm space-y-5 sticky top-28"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold" style={{ color: "var(--burgundy)" }}>
                  Send a Message
                </h3>
                <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--charcoal-light)" }}>
                  We usually respond within 2 to 4 hours.
                </p>
              </div>

              {submitted ? (
                <div className="py-8 text-center space-y-3">
                  <div
                    className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white"
                    style={{ backgroundColor: "var(--burgundy)" }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-serif text-lg font-bold" style={{ color: "var(--burgundy)" }}>
                    Message Received!
                  </h4>
                  <p className="text-xs text-charcoal-light max-w-xs mx-auto">
                    Thank you for reaching out. Our support specialist will review your note and get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold underline mt-2"
                    style={{ color: "var(--burgundy)" }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--charcoal)" }}>
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-burgundy"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--ivory)" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "var(--charcoal)" }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@email.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-burgundy"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--ivory)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "var(--charcoal)" }}>
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-burgundy"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--ivory)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--charcoal)" }}>
                      Inquiry Category
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-burgundy"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--ivory)" }}
                    >
                      <option value="Order Inquiry">Order & Delivery Status</option>
                      <option value="Product Details">Saree Fabric & Styling Inquiry</option>
                      <option value="Returns & Refund">Return or Exchange Request</option>
                      <option value="Wholesale / Custom">Bridal Trousseau & Custom Orders</option>
                      <option value="Other">Other Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--charcoal)" }}>
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please include order number if applicable..."
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-burgundy resize-none"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--ivory)" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all shadow-md hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--burgundy)" }}
                  >
                    <Send size={15} /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
