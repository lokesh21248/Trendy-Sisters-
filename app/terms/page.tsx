import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Trendy Sisters",
  description: "Terms and conditions of using Trendy Sisters online saree shopping platform.",
}

export default function TermsPage() {
  return (
    <div className="w-full py-12 px-4 max-w-4xl mx-auto space-y-6" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: "var(--burgundy)" }}>
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--charcoal-light)" }}>
          Last updated: September 2026
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-5 text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>
        <p>
          Welcome to Trendy Sisters. By accessing our website, browsing our collections, or purchasing our products, you agree to comply with and be bound by the following terms and conditions.
        </p>
        <h2 className="font-serif text-lg font-bold" style={{ color: "var(--burgundy)" }}>
          1. Handloom Product Authenticity & Color Variations
        </h2>
        <p>
          Each saree is handwoven or hand-finished by artisans. Minor irregularities in weave or motif placement are natural characteristics of handloom textiles and testify to genuine handwork rather than defects. Additionally, slight color variations may occur due to device screen calibration and studio lighting.
        </p>
        <h2 className="font-serif text-lg font-bold" style={{ color: "var(--burgundy)" }}>
          2. Pricing & Orders
        </h2>
        <p>
          All prices are listed in Indian Rupees (INR) inclusive of applicable GST. We reserve the right to cancel or refuse any order in the rare event of typographical pricing errors or unexpected inventory stock-outs.
        </p>
        <h2 className="font-serif text-lg font-bold" style={{ color: "var(--burgundy)" }}>
          3. Governing Law
        </h2>
        <p>
          These terms are governed by the laws of India, subject to the jurisdiction of courts in Andhra Pradesh.
        </p>
      </div>
    </div>
  )
}
