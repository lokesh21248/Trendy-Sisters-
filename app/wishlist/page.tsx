"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useWishlist } from "@/contexts/WishlistContext"
import { ProductCard, ProductCardSkeleton } from "@/components/products/ProductCard"
import type { ProductWithImages } from "@/types"

export default function WishlistPage() {
  const { wishlistIds } = useWishlist()
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (wishlistIds.size === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .in("id", Array.from(wishlistIds))
        .eq("is_active", true)

      setProducts((data || []) as ProductWithImages[])
      setLoading(false)
    }

    fetchWishlistProducts()
  }, [wishlistIds, supabase])

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        
        <div className="mb-8">
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal">My Wishlist</h1>
          <p className="text-sm text-[#9B8A7A] mt-1">
            {wishlistIds.size} saved item{wishlistIds.size !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[var(--border)]">
            <div className="w-20 h-20 rounded-full bg-ivory-dark flex items-center justify-center mx-auto mb-6">
              <Heart size={32} className="text-burgundy opacity-40" />
            </div>
            <h2 className="font-serif text-xl font-bold text-charcoal mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-[#9B8A7A] mb-8 max-w-md mx-auto">
              Save your favourite sarees here to easily find them later or share with friends.
            </p>
            <Link href="/shop" className="btn-primary inline-flex px-8">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
