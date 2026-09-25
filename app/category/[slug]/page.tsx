import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { ProductCard } from "@/components/products/ProductCard"
import { getSafeImageUrl, sanitizeProduct } from "@/lib/image-utils"
import type { ProductWithImages } from "@/types"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()
  return data as any
}

async function getCategoryProducts(categoryId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
  return (data || []) as any[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) return {}
  return {
    title: `${category.name} | Trendy Sisters`,
    description: category.description || `Shop ${category.name} at Trendy Sisters`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()

  const products = await getCategoryProducts(category.id)

  return (
    <div style={{ backgroundColor: "var(--ivory)" }}>
      {/* Category banner */}
      <div className="relative overflow-hidden" style={{ height: 240 }}>
        {category.image_url ? (
          <Image
            src={getSafeImageUrl(category.image_url)}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div style={{ backgroundColor: "var(--burgundy)" }} className="w-full h-full" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(37,32,29,0.85), rgba(37,32,29,0.3))" }}
        />
        <div className="absolute inset-0 flex flex-col justify-end px-6 lg:px-12 pb-8 max-w-7xl mx-auto">
          <p className="text-sm font-medium mb-1" style={{ color: "var(--gold)" }}>Category</p>
          <h1 className="font-serif text-3xl lg:text-5xl font-bold text-white mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-white/75 text-sm max-w-lg">{category.description}</p>
          )}
          <p className="text-white/50 text-xs mt-2">{products.length} sarees</p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-xl" style={{ color: "#9B8A7A" }}>
              No sarees in this category yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={sanitizeProduct(p) as ProductWithImages} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
