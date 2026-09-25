import { Database } from "./database"

export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Collection = Database["public"]["Tables"]["collections"]["Row"]
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Cart = Database["public"]["Tables"]["carts"]["Row"]
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"]
export type Address = Database["public"]["Tables"]["addresses"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type WishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"]
export type Banner = Database["public"]["Tables"]["banners"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]

export type ProductWithImages = Product & {
  product_images: ProductImage[]
  categories?: Category | null
}

export type CartItemWithProduct = CartItem & {
  products: ProductWithImages
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & { products: ProductWithImages })[]
  addresses?: Address | null
}

export type WishlistItemWithProduct = WishlistItem & {
  products: ProductWithImages
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"

export interface SearchSuggestion {
  type: "product" | "category" | "collection"
  id: string
  name: string
  slug: string
  image_url?: string | null
}
