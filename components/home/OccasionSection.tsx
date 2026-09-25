import Image from "next/image"
import Link from "next/link"
import { getSafeImageUrl } from "@/lib/image-utils"

const occasions = [
  {
    label: "Wedding",
    tag: "The Wedding Edit",
    href: "/shop?occasion=wedding",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop&q=80",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    label: "Festive",
    tag: "Festive Glow",
    href: "/shop?occasion=festive",
    image: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?w=600&h=400&fit=crop&q=80",
    span: "",
  },
  {
    label: "Party",
    tag: "Party Glam",
    href: "/shop?occasion=party",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=400&fit=crop&q=80",
    span: "",
  },
  {
    label: "Office",
    tag: "Office Chic",
    href: "/shop?occasion=office",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=400&fit=crop&q=80",
    span: "",
  },
  {
    label: "Casual",
    tag: "Everyday Elegance",
    href: "/shop?occasion=casual",
    image: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&h=400&fit=crop&q=80",
    span: "",
  },
]

export function OccasionSection() {
  return (
    <section className="w-full px-3 sm:px-4 lg:px-6 py-5 max-w-7xl mx-auto">
      <div className="mb-4">
        <h2 className="section-heading">Shop by Occasion</h2>
        <p className="text-sm mt-0.5" style={{ color: "#9B8A7A" }}>
          Find the perfect saree for every moment
        </p>
      </div>

      {/* Desktop bento grid */}
      <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
        {occasions.map((occ, i) => (
          <Link
            key={occ.label}
            href={occ.href}
            className={`relative overflow-hidden rounded-2xl group cursor-pointer ${occ.span}`}
          >
            <Image
              src={getSafeImageUrl(occ.image)}
              alt={occ.label}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 1280px) 25vw, 320px"
              loading="lazy"
            />
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                background: "linear-gradient(to top, rgba(37,32,29,0.85) 0%, transparent 60%)",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-white/70 text-xs mb-1 font-medium uppercase tracking-wider">
                {occ.label}
              </p>
              <h3 className="font-serif text-white text-lg font-semibold mb-3">{occ.tag}</h3>
              <span
                className="inline-block text-xs font-semibold px-3 py-1.5 rounded-lg transition-all group-hover:scale-105"
                style={{ backgroundColor: "var(--gold)", color: "white" }}
              >
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="lg:hidden flex gap-2.5 overflow-x-auto category-scroll pb-2">
        {occasions.map((occ) => (
          <Link
            key={occ.label}
            href={occ.href}
            className="relative overflow-hidden rounded-xl flex-shrink-0 group"
            style={{ width: 130, height: 175 }}
          >
            <Image
              src={getSafeImageUrl(occ.image)}
              alt={occ.label}
              fill
              className="object-cover"
              sizes="130px"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(37,32,29,0.85), transparent 60%)" }}
            />
            <div className="absolute bottom-2.5 left-2.5 right-2.5">
              <p className="text-white/70 text-[9px] uppercase tracking-wider">{occ.label}</p>
              <h3 className="font-serif text-white text-xs font-semibold leading-tight">{occ.tag}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
