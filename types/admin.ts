import { Database } from "./database"
import { Product, ProductImage, Category, Collection, Banner, OrderStatus } from "./index"

export type { Product, ProductImage, Category, Collection, Banner, OrderStatus }

export interface CompletenessCriterion {
  id: string
  label: string
  description: string
  weight: number
  passed: boolean
  value?: string | number | null
}

export interface DesignCompleteness {
  score: number // 0 to 100
  criteria: {
    fabric: CompletenessCriterion
    color: CompletenessCriterion
    occasion: CompletenessCriterion
    images: CompletenessCriterion & { imageCount: number }
    pricing: CompletenessCriterion & { discount: number }
    stockSku: CompletenessCriterion
  }
  missingFields: string[]
  isReadyForPublish: boolean
}

export type ProductWithDetails = Product & {
  product_images: ProductImage[]
  category?: Category | null
  collection?: Collection | null
  completeness: DesignCompleteness
}

export interface AdminOrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image?: string
  quantity: number
  price: number
  mrp: number
}

export interface AdminCustomerAddress {
  full_name: string
  phone: string
  house_flat: string
  street: string
  city: string
  state: string
  pincode: string
}

export interface AdminOrder {
  id: string
  order_number: string
  user_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  address: AdminCustomerAddress
  status: OrderStatus
  subtotal: number
  discount: number
  shipping: number
  total: number
  payment_method: "UPI" | "Card" | "Net Banking" | "Cash on Delivery"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  notes?: string | null
  order_items: AdminOrderItem[]
  created_at: string
  updated_at: string
}

export type FilterPill =
  | "all"
  | "complete"
  | "review"
  | "missing-fabric"
  | "missing-color"
  | "missing-occasion"
  | "missing-images"
  | "low-stock"

export interface ToastMessage {
  id: string
  title: string
  message: string
  type: "success" | "info" | "warning" | "error"
}

export interface SareeColorSwatch {
  name: string
  hex: string
  family: string
}

export const SAREE_COLOR_PALETTES: SareeColorSwatch[] = [
  { name: "Royal Magenta", hex: "#A11C54", family: "Pink/Magenta" },
  { name: "Midnight Blue", hex: "#102A45", family: "Blue" },
  { name: "Burgundy Wine", hex: "#651F35", family: "Burgundy/Red" },
  { name: "Deep Maroon", hex: "#5B0E1B", family: "Maroon" },
  { name: "Golden Yellow", hex: "#D4AF37", family: "Gold/Yellow" },
  { name: "Terracotta", hex: "#C85A32", family: "Rust/Orange" },
  { name: "Pastel Pink", hex: "#E8B4B8", family: "Pastel" },
  { name: "Sage Green", hex: "#8A9A86", family: "Green" },
  { name: "Emerald Green", hex: "#0F5A3B", family: "Green" },
  { name: "Peacock Blue", hex: "#005F73", family: "Blue" },
  { name: "Blush Peach", hex: "#F4C2A5", family: "Peach" },
  { name: "Mustard Gold", hex: "#D49B24", family: "Gold" },
  { name: "Crimson Red", hex: "#9E1B32", family: "Red" },
  { name: "Royal Navy", hex: "#0A192F", family: "Blue" },
  { name: "Ivory Cream", hex: "#FFF9EF", family: "White/Ivory" },
  { name: "Charcoal Obsidian", hex: "#25201D", family: "Black/Charcoal" },
]

export const SAREE_FABRICS = [
  "Pure Silk",
  "Banarasi Silk",
  "Kanjivaram Silk",
  "Chanderi Silk",
  "Sambalpuri Silk",
  "Pure Cotton",
  "Linen Cotton",
  "Georgette",
  "Organza",
  "Tussar Silk",
  "Chiffon",
  "Bandhani Silk",
  "Paithani Silk",
]

export const SAREE_OCCASIONS = [
  "Wedding",
  "Bridal",
  "Festive Luxe",
  "Party Wear",
  "Office",
  "Casual",
]

export const IMAGE_ANGLE_LABELS: Record<number, string> = {
  0: "0: Primary Full Drape",
  1: "1: Pleats & Silhouette",
  2: "2: Pallu Work & Zari Close-up",
  3: "3: Border & Weave Detail",
  4: "4: Blouse Piece & Motif",
}
