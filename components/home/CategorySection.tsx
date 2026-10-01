import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { createStaticClient } from "@/lib/supabase/server"
import { getSafeImageUrl } from "@/lib/image-utils"
import type { Category } from "@/types"

async function getCategories() {
  try {
    const supabase = createStaticClient()
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .limit(8)
    const rawCategories = data && data.length > 0 ? data : []
    return rawCategories.map((c: any) => ({
      ...c,
      image_url: getSafeImageUrl(c.image_url),
    }))
  } catch {
    return []
  }
}

export async function CategorySection() {
  const categories = await getCategories()

  return (
    <section className="w-full px-3 sm:px-4 lg:px-6 py-6 max-w-7xl mx-auto">
      {/* Heading */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-heading">Shop by Category</h2>
          <p className="text-sm mt-0.5" style={{ color: "#9B8A7A" }}>
            Explore our curated collections
          </p>
        </div>
        <Link
          href="/categories"
          className="flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-80 whitespace-nowrap"
          style={{ color: "var(--burgundy)" }}
        >
          See all <ArrowRight size={14} />
        </Link>
      </div>

      {/* Category grid — 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer block"
            style={{ aspectRatio: "1/1" }}
          >
            {/* Background image */}
            {cat.image_url ? (
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            ) : (
              <div style={{ backgroundColor: "var(--ivory-dark)" }} className="w-full h-full" />
            )}

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(37,32,29,0.85) 0%, rgba(37,32,29,0.15) 55%, transparent 100%)",
              }}
            />

            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
              <span
                className="font-semibold text-white block"
                style={{ fontSize: "clamp(0.7rem, 3vw, 0.875rem)", textShadow: "0 1px 4px rgba(0,0,0,0.5)", lineHeight: 1.3 }}
              >
                {cat.name}
              </span>
            </div>

            {/* Hover gold border */}
            <div
              className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              style={{ borderColor: "var(--gold)" }}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
