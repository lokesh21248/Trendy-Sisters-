import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getSafeImageUrl } from "@/lib/image-utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Saree Categories | Trendy Sisters",
  description: "Browse all curated saree categories including Silk, Cotton, Banarasi, Designer, and Festive collections.",
}

const fallbackCategories = [
  { id: "1", name: "Silk Sarees", slug: "silk-sarees", description: "Timeless pure & Kanjivaram silk weaves", image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=450&fit=crop" },
  { id: "2", name: "Cotton Sarees", slug: "cotton-sarees", description: "Breathable daily elegance & handlooms", image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=450&fit=crop" },
  { id: "3", name: "Banarasi Sarees", slug: "banarasi-sarees", description: "Regal zari work & royal Mughal motifs", image_url: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?w=600&h=450&fit=crop" },
  { id: "4", name: "Designer Sarees", slug: "designer-sarees", description: "Contemporary silhouettes & party trends", image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=450&fit=crop" },
  { id: "5", name: "Wedding Sarees", slug: "wedding-sarees", description: "Grand bridal drapes & heirloom treasures", image_url: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&h=450&fit=crop" },
  { id: "6", name: "Party Wear", slug: "party-wear", description: "Glamorous sequins, shimmer & modern pleats", image_url: "https://images.unsplash.com/photo-1610030469839-f909584b43f1?w=600&h=450&fit=crop" },
  { id: "7", name: "Festive Collection", slug: "festive-collection", description: "Vibrant colors for pujas & family celebrations", image_url: "https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?w=600&h=450&fit=crop" },
  { id: "8", name: "Printed Sarees", slug: "printed-sarees", description: "Artistic florals, kalamkari & geometric motifs", image_url: "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?w=600&h=450&fit=crop" },
]

async function getCategories() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
    const rawCategories = data && data.length > 0 ? data : fallbackCategories
    return rawCategories.map((c: any) => ({
      ...c,
      image_url: getSafeImageUrl(c.image_url),
    }))
  } catch {
    return fallbackCategories
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ backgroundColor: "rgba(101,31,53,0.08)", color: "var(--burgundy)" }}
          >
            <Sparkles size={12} />
            Handpicked Weaves
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: "var(--charcoal)" }}>
            Explore All Categories
          </h1>
          <p className="text-sm sm:text-base" style={{ color: "#9B8A7A" }}>
            Find the perfect drape for weddings, festivals, everyday grace, and special celebrations.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                backgroundColor: "white",
                border: "1px solid var(--border)",
              }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ backgroundColor: "var(--ivory-dark)" }}>
                {cat.image_url && (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(37,32,29,0.7) 0%, transparent 60%)",
                  }}
                />
                <span
                  className="absolute bottom-2.5 left-3 text-xs font-semibold text-white drop-shadow-sm flex items-center gap-1 opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                >
                  View Collection <ArrowRight size={12} />
                </span>
              </div>

              <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h2 className="font-serif font-bold text-base sm:text-lg mb-1" style={{ color: "var(--charcoal)" }}>
                    {cat.name}
                  </h2>
                  <p className="text-xs line-clamp-2" style={{ color: "#9B8A7A" }}>
                    {cat.description || "Discover authentic drapes crafted with traditional artistry."}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
