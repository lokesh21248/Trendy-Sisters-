"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface WishlistContextType {
  wishlistIds: Set<string>
  toggle: (productId: string) => Promise<void>
  isWishlisted: (productId: string) => boolean
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(),
  toggle: async () => {},
  isWishlisted: () => false,
  loading: false,
})

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [wishlistId, setWishlistId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchWishlist = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setWishlistIds(new Set()); return }

    // Get or create wishlist
    let { data: wl } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!wl) {
      const { data: newWl } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id } as any)
        .select("id")
        .single()
      wl = newWl as any
    }

    if (!wl) return
    setWishlistId((wl as any).id)

    const { data: items } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("wishlist_id", (wl as any).id)

    setWishlistIds(new Set(items?.map((i: any) => i.product_id) || []))
  }, [supabase])

  useEffect(() => {
    fetchWishlist()
    const { data: listener } = supabase.auth.onAuthStateChange(() => fetchWishlist())
    return () => listener?.subscription.unsubscribe()
  }, [fetchWishlist, supabase.auth])

  const toggle = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = "/auth/login"; return }

    setLoading(true)
    try {
      const isWishlisted = wishlistIds.has(productId)

      if (isWishlisted) {
        await supabase
          .from("wishlist_items")
          .delete()
          .eq("wishlist_id", wishlistId!)
          .eq("product_id", productId)

        setWishlistIds((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
      } else {
        await supabase
          .from("wishlist_items")
          .insert({ wishlist_id: wishlistId!, product_id: productId } as any)

        setWishlistIds((prev) => new Set([...prev, productId]))
      }
    } finally {
      setLoading(false)
    }
  }

  const isWishlisted = (productId: string) => wishlistIds.has(productId)

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggle, isWishlisted, loading }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
