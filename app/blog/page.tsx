import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Sparkles, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Saree Stories & Style Journal — Trendy Sisters",
  description: "Explore articles on saree draping techniques, handloom history, bridal styling tips, and fabric care from Trendy Sisters.",
}

export default function BlogPage() {
  const articles = [
    {
      title: "The Timeless Splendor of Pure Kanjivaram Silk",
      excerpt: "Unraveling the sacred motifs, mulberry silk threads, and pure gold zari that make Kanjivarams South India's pride.",
      date: "September 2026",
      readTime: "5 min read",
      category: "Heritage Weaves",
    },
    {
      title: "5 Elegant Saree Draping Styles for Festive Occasions",
      excerpt: "Step-by-step guidance from classic Nivi drape to modern mermaid and butterfly silhouettes.",
      date: "August 2026",
      readTime: "4 min read",
      category: "Style & Draping",
    },
    {
      title: "How to Store and Preserve Heirloom Silk Sarees",
      excerpt: "Practical tips to prevent zari tarnishing, fabric creasing, and moth damage for generations to come.",
      date: "July 2026",
      readTime: "6 min read",
      category: "Care Guide",
    },
  ]

  return (
    <div className="w-full py-12 px-4 max-w-5xl mx-auto space-y-10" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="border-b pb-6 text-center space-y-2" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full border" style={{ borderColor: "var(--gold)", color: "var(--burgundy)" }}>
          The Saree Journal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: "var(--burgundy)" }}>
          Stories, Styling & Heritage
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-light max-w-xl mx-auto">
          Delve into the art of Indian textiles, weaver stories, and timeless styling inspiration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((item, idx) => (
          <article
            key={idx}
            className="p-6 rounded-2xl bg-white border shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-charcoal-light mb-3">
                <span className="font-semibold text-burgundy" style={{ color: "var(--burgundy)" }}>
                  {item.category}
                </span>
                <span>{item.readTime}</span>
              </div>
              <h2 className="font-serif text-lg font-bold mb-2 leading-snug" style={{ color: "var(--charcoal)" }}>
                {item.title}
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-charcoal-light">
                {item.excerpt}
              </p>
            </div>
            <div className="pt-6 border-t mt-4 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs text-charcoal-light">{item.date}</span>
              <Link href="/shop" className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--burgundy)" }}>
                Explore Sarees <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
