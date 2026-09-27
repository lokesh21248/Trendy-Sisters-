import type { Metadata } from "next"
import Link from "next/link"
import { Truck, Clock, ShieldCheck, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy — Trendy Sisters",
  description: "Learn about Trendy Sisters shipping charges, delivery times across India, and courier tracking details.",
}

export default function ShippingPage() {
  return (
    <div className="w-full py-12 px-4 max-w-4xl mx-auto space-y-8" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--gold-dark)" }}>
          Store Policies
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2" style={{ color: "var(--burgundy)" }}>
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--charcoal-light)" }}>
          Last updated: September 2026
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border" style={{ borderColor: "var(--border)" }}>
          <Truck className="mb-2 text-burgundy" size={24} style={{ color: "var(--burgundy)" }} />
          <h3 className="font-semibold text-sm">Free Shipping</h3>
          <p className="text-xs text-charcoal-light mt-1">On all domestic orders above ₹999.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border" style={{ borderColor: "var(--border)" }}>
          <Clock className="mb-2 text-burgundy" size={24} style={{ color: "var(--burgundy)" }} />
          <h3 className="font-semibold text-sm">3–7 Business Days</h3>
          <p className="text-xs text-charcoal-light mt-1">Fast delivery across all major Indian cities.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border" style={{ borderColor: "var(--border)" }}>
          <ShieldCheck className="mb-2 text-burgundy" size={24} style={{ color: "var(--burgundy)" }} />
          <h3 className="font-semibold text-sm">Insured Transit</h3>
          <p className="text-xs text-charcoal-light mt-1">Tamper-evident packaging for pure silk sarees.</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold" style={{ color: "var(--burgundy)" }}>
            1. Order Processing Time
          </h2>
          <p>
            All ready-to-ship sarees are dispatched within 24 to 48 hours of order confirmation. For sarees requiring custom blouse tailoring, fall, or pico finishing, please allow an additional 2 to 3 business days prior to dispatch.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold" style={{ color: "var(--burgundy)" }}>
            2. Domestic Shipping Rates & Timelines
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Orders above ₹999:</strong> Free standard shipping across India.</li>
            <li><strong>Orders below ₹999:</strong> A nominal flat shipping charge of ₹99 applies.</li>
            <li><strong>Metro Cities:</strong> 3 to 5 business days delivery.</li>
            <li><strong>Rest of India:</strong> 4 to 7 business days delivery.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold" style={{ color: "var(--burgundy)" }}>
            3. Tracking Your Consignment
          </h2>
          <p>
            Once your order is handed over to our courier partners (Blue Dart, Delhivery, or DTDC), you will receive a tracking link via SMS, WhatsApp, and email. You can also monitor real-time tracking in your{" "}
            <Link href="/account/orders" className="underline font-semibold" style={{ color: "var(--burgundy)" }}>
              My Orders
            </Link>{" "}
            dashboard.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold" style={{ color: "var(--burgundy)" }}>
            4. Need Assistance?
          </h2>
          <p>
            For urgent shipping inquiries or expedited bridal dispatch requests, please contact our support desk via WhatsApp at +91 63041 44691 or visit our{" "}
            <Link href="/support" className="underline font-semibold" style={{ color: "var(--burgundy)" }}>
              Support Page
            </Link>.
          </p>
        </section>
      </div>
    </div>
  )
}
