import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Trendy Sisters",
  description: "Privacy and data protection policy for Trendy Sisters saree store.",
}

export default function PrivacyPage() {
  return (
    <div className="w-full py-12 px-4 max-w-4xl mx-auto space-y-6" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: "var(--burgundy)" }}>
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--charcoal-light)" }}>
          Last updated: September 2026
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-5 text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>
        <p>
          At Trendy Sisters, we respect your personal privacy and are committed to safeguarding the information you share with us while browsing our online saree boutique and placing orders.
        </p>
        <h2 className="font-serif text-lg font-bold" style={{ color: "var(--burgundy)" }}>
          1. Information We Collect
        </h2>
        <p>
          When you register an account, make a purchase, or contact our support team, we may collect your name, shipping address, email address, phone number, and billing details. Payment card details are processed directly by RBI-authorized payment gateways and are never stored on our servers.
        </p>
        <h2 className="font-serif text-lg font-bold" style={{ color: "var(--burgundy)" }}>
          2. How We Use Your Data
        </h2>
        <p>
          Your information is used exclusively to fulfill orders, provide shipment tracking via SMS and WhatsApp, assist with inquiries, and keep you informed of special promotions (if opted in).
        </p>
        <h2 className="font-serif text-lg font-bold" style={{ color: "var(--burgundy)" }}>
          3. Contact Us
        </h2>
        <p>
          If you have questions about your personal data, please contact us at <strong>support@trendysisters.com</strong> or call <strong>+91 63041 44691</strong>.
        </p>
      </div>
    </div>
  )
}
