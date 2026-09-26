"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface WishlistContextType {
  wishlistIds: Set<string>
  toggle: (productId: string) => Promise<void>
  isWishlisted: (productId: string) => boolean
  loading: boolean
}

const LOCAL_STORAGE_KEY = "trendy_sisters_wishlist"

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(),
  toggle: async () => {},
  isWishlisted: () => false,
  loading: false,
})

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const wishlistIdRef = useRef<string | null>(null)
  const userIdRef = useRef<string | null>(null)
  const supabase = createClient()

  // Load from local storage initially for instant display
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setWishlistIds(new Set(parsed))
        }
      }
    } catch {
      // Local storage unavailable
    }
  }, [])

  const syncWishlist = useCallback(async (userId: string) => {
    try {
      let { data: wl } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (!wl) {
        const { data: newWl } = await supabase
          .from("wishlists")
          .insert({ user_id: userId } as any)
          .select("id")
          .single()
        wl = newWl as any
      }

      if (!wl) return
      wishlistIdRef.current = (wl as any).id

      const { data: items } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("wishlist_id", (wl as any).id)

      const serverIds = new Set(items?.map((i: any) => i.product_id) || [])

      // Merge with any local storage items
      let combined = new Set(serverIds)
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (stored) {
          const localIds: string[] = JSON.parse(stored)
          for (const id of localIds) {
            if (!combined.has(id)) {
              combined.add(id)
              // Sync local item to server in background
              supabase.from("wishlist_items").insert({
                wishlist_id: (wl as any).id,
                product_id: id,
              } as any).then(() => {})
            }
          }
        }
      } catch {}

      setWishlistIds(combined)
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(combined)))
      } catch {}
    } catch (e) {
      console.error("Error syncing wishlist:", e)
    }
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        userIdRef.current = session.user.id
        syncWishlist(session.user.id)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        userIdRef.current = session.user.id
        syncWishlist(session.user.id)
      } else {
        userIdRef.current = null
        wishlistIdRef.current = null
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [supabase, syncWishlist])

  const toggle = async (productId: string) => {
    // 1. Instant optimistic update in memory & local storage
    const willBeWishlisted = !wishlistIds.has(productId)
    const nextIds = new Set(wishlistIds)

    if (willBeWishlisted) {
      nextIds.add(productId)
    } else {
      nextIds.delete(productId)
    }

    setWishlistIds(nextIds)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(nextIds)))
    } catch {}

    // 2. Background sync to Supabase if authenticated
    const userId = userIdRef.current
    if (!userId) {
      // Guest user: state is already saved in localStorage
      return
    }

    try {
      let currentWishlistId = wishlistIdRef.current
      if (!currentWishlistId) {
        const { data: wl } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle()

        if (wl) {
          currentWishlistId = (wl as any).id
          wishlistIdRef.current = currentWishlistId
        } else {
          const { data: newWl } = await supabase
            .from("wishlists")
            .insert({ user_id: userId } as any)
            .select("id")
            .single()
          currentWishlistId = (newWl as any)?.id
          wishlistIdRef.current = currentWishlistId
        }
      }

      if (!currentWishlistId) return

      if (willBeWishlisted) {
        await supabase
          .from("wishlist_items")
          .insert({ wishlist_id: currentWishlistId, product_id: productId } as any)
      } else {
        await supabase
          .from("wishlist_items")
          .delete()
          .eq("wishlist_id", currentWishlistId)
          .eq("product_id", productId)
      }
    } catch (err) {
      console.error("Wishlist background sync failed:", err)
      // Rollback on failure
      setWishlistIds(wishlistIds)
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(wishlistIds)))
      } catch {}
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
