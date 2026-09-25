import Link from "next/link"
import Image from "next/image"
import { Sparkles, ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Curated Saree Collections | Trendy Sisters",
  description: "Explore exclusive curated collections by Trendy Sisters — The Wedding Edit, Festive Luxe, Heritage Weaves, and more.",
}

const collections = [
  {
    title: "The Wedding Edit",
    slug: "wedding-edit",
    tagline: "Bridal Opulence & Heirloom Treasures",
    description: "Grand Kanjivaram silks, heavy zari borders, and royal bridal palettes for the auspicious day.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&h=700&fit=crop&q=85",
    link: "/shop?occasion=Wedding",
    badge: "Most Loved",
  },
  {
    title: "Festive Luxe",
    slug: "festive-luxe",
    tagline: "Vibrant Weaves for Grand Festivities",
    description: "Rich jewel tones, glowing zari weaves, and effortless drape designed for Diwali, Pongal, and celebrations.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&h=700&fit=crop&q=85",
    link: "/shop?occasion=Festive",
    badge: "Trending",
  },
  {
    title: "Heritage Weaves",
    slug: "heritage-weaves",
    tagline: "Centuries of Craftsmanship in Every Thread",
    description: "Authentic handlooms honoring India's greatest weaving traditions, from Varanasi to Kanchipuram.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&h=700&fit=crop&q=85",
    link: "/shop?filter=bestseller",
    badge: "Pure Craft",
  },
  {
    title: "Modern Minimalist",
    slug: "modern-minimalist",
    tagline: "Understated Grace for the Contemporary Woman",
    description: "Lightweight organzas, breezy chanderis, and subtle pastel palettes for office and intimate gatherings.",
    image: "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?w=1000&h=700&fit=crop&q=85",
    link: "/shop?occasion=Party",
    badge: "New Release",
  },
]

export default function CollectionsPage() {
  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ backgroundColor: "rgba(184,138,59,0.15)", color: "var(--gold-dark)" }}
          >
            <Sparkles size={12} />
            Exclusive Edits
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-3" style={{ color: "var(--charcoal)" }}>
            Curated Collections
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#9B8A7A" }}>
            Thoughtfully curated saree stories celebrating the timeless artistry of Indian heritage.
          </p>
        </div>

        {/* Collections Stack */}
        <div className="space-y-6 sm:space-y-10">
          {collections.map((col, idx) => (
            <div
              key={col.slug}
              className={`grid md:grid-cols-2 gap-6 sm:gap-8 items-center p-4 sm:p-8 rounded-3xl transition-all duration-300 hover:shadow-xl ${
                idx % 2 === 1 ? "md:grid-flow-dense" : ""
              }`}
              style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
            >
              <div
                className={`relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl ${
                  idx % 2 === 1 ? "md:col-start-2" : ""
                }`}
              >
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <span
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
                  style={{ backgroundColor: "var(--burgundy)" }}
                >
                  {col.badge}
                </span>
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--gold-dark)" }}>
                  {col.tagline}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3" style={{ color: "var(--charcoal)" }}>
                  {col.title}
                </h2>
                <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: "#7A6B5C" }}>
                  {col.description}
                </p>
                <div>
                  <Link
                    href={col.link}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: "var(--burgundy)", color: "white" }}
                  >
                    Explore Collection <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
