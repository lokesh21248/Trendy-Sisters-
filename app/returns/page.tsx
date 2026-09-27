import type { Metadata } from "next"
import Link from "next/link"
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Returns & Exchange Policy — Trendy Sisters",
  description: "Read the 7-day return and exchange policy for Trendy Sisters authentic Indian sarees.",
}

export default function ReturnsPage() {
  return (
    <div className="w-full py-12 px-4 max-w-4xl mx-auto space-y-8" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--gold-dark)" }}>
          Store Policies
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2" style={{ color: "var(--burgundy)" }}>
          Returns & Exchange Policy
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--charcoal-light)" }}>
          Hassle-free 7-day return and replacement assurance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold text-base mb-2 flex items-center gap-2" style={{ color: "var(--burgundy)" }}>
            <CheckCircle2 size={18} className="text-green-600" /> Eligible for Return
          </h3>
          <ul className="text-xs sm:text-sm space-y-1.5 text-charcoal-light list-disc pl-4">
            <li>Unused sarees in original fold and packaging.</li>
            <li>Original tags, brand cards, and security seals intact.</li>
            <li>Request initiated within 7 days of package delivery.</li>
            <li>Wrong color/item delivered or manufacturing defect.</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white border" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold text-base mb-2 flex items-center gap-2" style={{ color: "var(--burgundy)" }}>
            <AlertCircle size={18} className="text-amber-600" /> Non-Returnable Items
          </h3>
          <ul className="text-xs sm:text-sm space-y-1.5 text-charcoal-light list-disc pl-4">
            <li>Sarees with fall, pico, or tassels already stitched.</li>
            <li>Custom stitched or tailored blouse pieces.</li>
            <li>Items that show wear, perfume scents, or damage caused post-delivery.</li>
            <li>Items purchased during clearance liquidation sales.</li>
          </ul>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold" style={{ color: "var(--burgundy)" }}>
            How to Request a Return or Exchange
          </h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Send a message on WhatsApp to <strong>+91 63041 44691</strong> or email support at{" "}
              <strong>support@trendysisters.com</strong> with your order ID and photos of the saree.
            </li>
            <li>
              Our team will review the request within 24 business hours and schedule a reverse pickup from your address.
            </li>
            <li>
              Once the returned saree passes quality inspection at our facility, refunds are initiated within 3–5 working days to your original payment method (or store credits for COD orders).
            </li>
          </ol>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold" style={{ color: "var(--burgundy)" }}>
            Need Assistance?
          </h2>
          <p>
            Please visit our{" "}
            <Link href="/support" className="underline font-semibold" style={{ color: "var(--burgundy)" }}>
              Support Center
            </Link>{" "}
            or chat with us directly for any return concerns.
          </p>
        </section>
      </div>
    </div>
  )
}
