import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Trendy Sisters",
  description: "Find answers to commonly asked questions about sarees, orders, shipping, and fabric care at Trendy Sisters.",
}

export default function FAQPage() {
  const faqCategories = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          q: "How do I know my order is confirmed?",
          a: "You will immediately receive an order confirmation email and an SMS/WhatsApp notification with your order details and invoice.",
        },
        {
          q: "Do you ship internationally?",
          a: "Currently, our website caters to delivery addresses across India. For international inquiries, please contact our support team on WhatsApp at +91 63041 44691.",
        },
        {
          q: "Is Cash on Delivery (COD) available?",
          a: "Yes, COD is available for most serviceable pin codes across India on orders up to ₹10,000.",
        },
      ],
    },
    {
      category: "Fabric & Authenticity",
      questions: [
        {
          q: "How do I identify pure silk from synthetic silk?",
          a: "Pure silk features subtle natural weave variations, a warm touch, and rich luster. Our pure silk sarees come with Silk Mark authenticity verification.",
        },
        {
          q: "Does the saree come with a blouse piece?",
          a: "Yes, almost all our sarees include an unstitched matching or contrasting blouse piece measuring approximately 0.8 meters, attached to the saree body.",
        },
        {
          q: "How should I wash and care for silk sarees?",
          a: "Dry cleaning is strongly recommended for all pure silk, zari, and embroidered sarees. Store folded in a breathable cotton or muslin bag.",
        },
      ],
    },
  ]

  return (
    <div className="w-full py-12 px-4 max-w-4xl mx-auto space-y-8" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--gold-dark)" }}>
          Help Center
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2" style={{ color: "var(--burgundy)" }}>
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--charcoal-light)" }}>
          Everything you need to know about shopping with Trendy Sisters.
        </p>
      </div>

      <div className="space-y-8">
        {faqCategories.map((cat, cIdx) => (
          <div key={cIdx} className="space-y-3">
            <h2 className="font-serif text-xl font-bold" style={{ color: "var(--burgundy)" }}>
              {cat.category}
            </h2>
            <div className="space-y-3">
              {cat.questions.map((item, qIdx) => (
                <div
                  key={qIdx}
                  className="p-5 rounded-2xl bg-white border shadow-sm"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h3 className="font-semibold text-sm sm:text-base mb-1.5" style={{ color: "var(--charcoal)" }}>
                    {item.q}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--charcoal-light)" }}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl border text-center space-y-3" style={{ backgroundColor: "var(--ivory-dark)", borderColor: "var(--border)" }}>
        <h3 className="font-serif text-lg font-bold" style={{ color: "var(--burgundy)" }}>
          Didn’t find the answer you were looking for?
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-light">
          Our friendly support team is always happy to assist you directly.
        </p>
        <div>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow"
            style={{ backgroundColor: "var(--burgundy)" }}
          >
            Contact Customer Support <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
