import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ProductCard, ProductCardSkeleton } from "@/components/products/ProductCard"
import { sanitizeProduct } from "@/lib/image-utils"
import type { ProductWithImages } from "@/types"
import { Suspense } from "react"

interface ProductSectionProps {
  title: string
  subtitle?: string
  viewAllHref: string
  viewAllLabel?: string
  filter: "new" | "bestseller" | "featured"
}

async function ProductList({ filter }: { filter: string }) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("products")
      .select(`*, product_images(*)`)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8)

    if (filter === "new") query = query.eq("is_new", true)
    else if (filter === "bestseller") query = query.eq("is_bestseller", true)
    else if (filter === "featured") query = query.eq("is_featured", true)

    const { data: products } = await query

    const typedProducts = products as any[];

    if (!typedProducts || typedProducts.length === 0) {
      return (
        <div className="col-span-full py-12 text-center">
          <p style={{ color: "#9B8A7A" }}>Products coming soon...</p>
        </div>
      )
    }

    return (
      <>
        {typedProducts.map((product) => (
          <ProductCard key={product.id} product={sanitizeProduct(product) as ProductWithImages} />
        ))}
      </>
    )
  } catch {
    return (
      <div className="col-span-full py-12 text-center">
        <p style={{ color: "#9B8A7A" }}>Unable to load products</p>
      </div>
    )
  }
}

function ProductListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </>
  )
}

export function ProductSection({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
  filter,
}: ProductSectionProps) {
  return (
    <section className="w-full px-3 sm:px-4 lg:px-6 py-5 max-w-7xl mx-auto">
      {/* Heading */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-heading">{title}</h2>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: "#9B8A7A" }}>
              {subtitle}
            </p>
          )}
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-80 whitespace-nowrap"
          style={{ color: "var(--burgundy)" }}
        >
          {viewAllLabel} <ArrowRight size={14} />
        </Link>
      </div>

      {/* Product grid — exactly 2 cols on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-5">
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList filter={filter} />
        </Suspense>
      </div>
    </section>
  )
}
