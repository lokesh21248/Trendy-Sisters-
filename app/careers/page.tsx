import type { Metadata } from "next"
import Link from "next/link"
import { Briefcase, Heart, Sparkles, Send } from "lucide-react"

export const metadata: Metadata = {
  title: "Careers — Join the Trendy Sisters Family",
  description: "Explore career opportunities in handloom merchandising, digital marketing, customer success, and operations at Trendy Sisters.",
}

export default function CareersPage() {
  return (
    <div className="w-full py-12 px-4 max-w-4xl mx-auto space-y-8" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="border-b pb-6 text-center space-y-2" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full border" style={{ borderColor: "var(--gold)", color: "var(--burgundy)" }}>
          Work With Us
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: "var(--burgundy)" }}>
          Join the Trendy Sisters Family
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-light max-w-lg mx-auto">
          Help us empower artisan handloom weavers and bring authentic Indian textiles to women worldwide.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-white border text-center space-y-4" style={{ borderColor: "var(--border)" }}>
        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-burgundy" style={{ backgroundColor: "var(--ivory-dark)", color: "var(--burgundy)" }}>
          <Briefcase size={22} />
        </div>
        <h2 className="font-serif text-xl font-bold" style={{ color: "var(--burgundy)" }}>
          Passionate about Indian Handlooms & Fashion?
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-light max-w-md mx-auto leading-relaxed">
          We are always looking for creative storytellers, textile sourcing specialists, and customer care champions. Send your portfolio and resume directly to our founding team.
        </p>
        <div className="pt-2">
          <a
            href="mailto:careers@trendysisters.com?subject=Career%20Application%20at%20Trendy%20Sisters"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--burgundy)" }}
          >
            <Send size={15} /> Email Your Resume (careers@trendysisters.com)
          </a>
        </div>
      </div>
    </div>
  )
}
