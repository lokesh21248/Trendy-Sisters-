"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { CartItemWithProduct, ProductWithImages } from "@/types"

interface CartContextType {
  items: CartItemWithProduct[]
  itemCount: number
  total: number
  loading: boolean
  addItem: (productId: string, quantity?: number, productDetails?: ProductWithImages) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  refetch: () => Promise<void>
  clearCart: () => Promise<void>
}

const LOCAL_STORAGE_CART_KEY = "trendy_sisters_cart"

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  total: 0,
  loading: false,
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  refetch: async () => {},
  clearCart: async () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(false)
  const cartIdRef = useRef<string | null>(null)
  const userIdRef = useRef<string | null>(null)
  const supabase = createClient()

  // 1. Load cached cart from localStorage on mount for 0ms initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CART_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed)
        }
      }
    } catch {
      // Local storage unavailable
    }
  }, [])

  // Helper to persist current items to localStorage
  const saveToLocalStorage = (newItems: CartItemWithProduct[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(newItems))
    } catch {}
  }

  // Helper to get or create cart ID for a user
  const getOrCreateCartId = async (userId: string): Promise<string | null> => {
    if (cartIdRef.current) return cartIdRef.current

    try {
      const { data: existing } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (existing) {
        cartIdRef.current = (existing as any).id
        return (existing as any).id
      }

      const { data: newCart } = await supabase
        .from("carts")
        .insert({ user_id: userId } as any)
        .select("id")
        .single()

      if (newCart) {
        cartIdRef.current = (newCart as any).id
        return (newCart as any).id
      }
    } catch (e) {
      console.error("Error retrieving cart ID:", e)
    }

    return null
  }

  // Refetch cart items from Supabase
  const refetch = useCallback(async () => {
    const userId = userIdRef.current
    if (!userId) return

    try {
      const cartId = await getOrCreateCartId(userId)
      if (!cartId) return

      const { data } = await supabase
        .from("cart_items")
        .select(`
          *,
          products (
            *,
            product_images (*)
          )
        `)
        .eq("cart_id", cartId)
        .order("created_at", { ascending: false })

      const serverItems = (data as CartItemWithProduct[]) || []
      setItems(serverItems)
      saveToLocalStorage(serverItems)
    } catch (e) {
      console.error("Error refetching cart:", e)
    }
  }, [supabase])

  // Sync user and cart on session change
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        userIdRef.current = session.user.id
        await refetch()
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        userIdRef.current = session.user.id
        await refetch()
      } else {
        userIdRef.current = null
        cartIdRef.current = null
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [supabase, refetch])

  // Optimistic Add Item
  const addItem = async (productId: string, quantity = 1, productDetails?: ProductWithImages) => {
    const existingIndex = items.findIndex((i) => i.product_id === productId)

    if (existingIndex > -1) {
      // Item already in cart: immediately increment quantity
      const updated = [...items]
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      }
      setItems(updated)
      saveToLocalStorage(updated)

      // Sync to database if logged in
      const userId = userIdRef.current
      if (userId) {
        const itemToUpdate = updated[existingIndex]
        if (itemToUpdate.id && !itemToUpdate.id.startsWith("temp-")) {
          ;(supabase.from("cart_items") as any)
            .update({ quantity: itemToUpdate.quantity })
            .eq("id", itemToUpdate.id)
            .then(() => {})
        }
      }
      return
    }

    // New item: construct optimistic cart item
    let productData: ProductWithImages | undefined = productDetails

    if (!productData) {
      // Try to fetch product details quickly if not provided
      try {
        const { data: fetched } = await supabase
          .from("products")
          .select("*, product_images(*)")
          .eq("id", productId)
          .single()
        if (fetched) productData = fetched as any
      } catch {}
    }

    const tempId = `temp-${Date.now()}`
    const optimisticItem: CartItemWithProduct = {
      id: tempId,
      cart_id: cartIdRef.current || "guest-cart",
      product_id: productId,
      quantity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      products: productData || ({ id: productId, name: "Saree", price: 0, mrp: 0 } as any),
    }

    const newItems = [optimisticItem, ...items]
    setItems(newItems)
    saveToLocalStorage(newItems)

    // Sync to database if logged in
    const userId = userIdRef.current
    if (userId) {
      try {
        const cartId = await getOrCreateCartId(userId)
        if (cartId) {
          const { data: inserted } = await supabase
            .from("cart_items")
            .insert({ cart_id: cartId, product_id: productId, quantity } as any)
            .select("id")
            .single()

          if (inserted) {
            // Replace temporary ID with actual server ID
            setItems((prev) => {
              const replaced = prev.map((item) =>
                item.id === tempId ? { ...item, id: (inserted as any).id, cart_id: cartId } : item
              )
              saveToLocalStorage(replaced)
              return replaced
            })
          }
        }
      } catch (err) {
        console.error("Failed to sync added cart item:", err)
      }
    }
  }

  // Optimistic Remove Item
  const removeItem = async (cartItemId: string) => {
    const updated = items.filter((i) => i.id !== cartItemId)
    setItems(updated)
    saveToLocalStorage(updated)

    const userId = userIdRef.current
    if (userId && !cartItemId.startsWith("temp-")) {
      supabase.from("cart_items").delete().eq("id", cartItemId).then(() => {})
    }
  }

  // Optimistic Update Quantity
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(cartItemId)
      return
    }

    const updated = items.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    setItems(updated)
    saveToLocalStorage(updated)

    const userId = userIdRef.current
    if (userId && !cartItemId.startsWith("temp-")) {
      ;(supabase.from("cart_items") as any)
        .update({ quantity })
        .eq("id", cartItemId)
        .then(() => {})
    }
  }

  // Clear Cart
  const clearCart = async () => {
    setItems([])
    saveToLocalStorage([])

    const userId = userIdRef.current
    if (userId) {
      const cartId = cartIdRef.current
      if (cartId) {
        supabase.from("cart_items").delete().eq("cart_id", cartId).then(() => {})
      }
    }
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        refetch,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
