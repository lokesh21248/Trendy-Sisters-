"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { CartItemWithProduct } from "@/types"

interface CartContextType {
  items: CartItemWithProduct[]
  itemCount: number
  total: number
  loading: boolean
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  refetch: () => Promise<void>
  clearCart: () => Promise<void>
}

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
  const supabase = createClient()

  const refetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setItems([]); return }

    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    const typedCart = cart as any;
    if (!typedCart) { setItems([]); return }

    const { data } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (
          *,
          product_images (*)
        )
      `)
      .eq("cart_id", typedCart.id)
      .order("created_at", { ascending: false })

    setItems((data as CartItemWithProduct[]) || [])
  }, [supabase])

  useEffect(() => {
    refetch()
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      refetch()
    })
    return () => listener?.subscription.unsubscribe()
  }, [refetch, supabase.auth])

  const getOrCreateCart = async (userId: string) => {
    const { data: existing } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single()

    const typedExisting = existing as any;
    if (typedExisting) return typedExisting.id

    const { data: newCart } = await supabase
      .from("carts")
      .insert({ user_id: userId } as any)
      .select("id")
      .single()

    return (newCart as any)?.id
  }

  const addItem = async (productId: string, quantity = 1) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = "/auth/login"; return }

      const cartId = await getOrCreateCart(user.id)
      if (!cartId) return

      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", productId)
        .single()

      const typedExisting = existing as any;
      if (typedExisting) {
        // @ts-ignore
        await supabase.from("cart_items").update({ quantity: typedExisting.quantity + quantity }).eq("id", typedExisting.id)
      } else {
        // @ts-ignore
        await supabase.from("cart_items").insert({ cart_id: cartId, product_id: productId, quantity })
      }

      await refetch()
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (cartItemId: string) => {
    await supabase.from("cart_items").delete().eq("id", cartItemId)
    await refetch()
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) { await removeItem(cartItemId); return }
    // @ts-ignore
    await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId)
    await refetch()
  }

  const clearCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const cartId = await getOrCreateCart(user.id)
    if (!cartId) return
    await supabase.from("cart_items").delete().eq("cart_id", cartId)
    await refetch()
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, itemCount, total, loading, addItem, removeItem, updateQuantity, refetch, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
