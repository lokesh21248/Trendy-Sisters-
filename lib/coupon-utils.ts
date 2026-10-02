import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"
import { Coupon } from "@/types/database"

export async function getActiveCoupons() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efirqiluvuerurnpptfm.supabase.co"
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_xHWxpegsG3AQTZt4mqubiQ_it5Go61G"
  
  const supabase = createClient(supabaseUrl, apiKey)
  
  const { data: rawData, error } = await (supabase as any)
    .from("coupons")
    .select("*")
    .eq("is_active", true)

  const data = rawData as Coupon[] | null

  if (error) {
    console.error("Error fetching coupons:", error)
    return []
  }

  // filter out expired
  const now = new Date()
  return (data || []).filter(c => {
    if (c.expires_at && new Date(c.expires_at) < now) return false
    if (c.usage_limit && c.times_used >= c.usage_limit) return false
    return true
  })
}

export function calculateCouponDiscount(coupon: Coupon, cartTotal: number): number {
  if (cartTotal < coupon.min_order_value) return 0
  
  let discount = 0
  if (coupon.discount_type === "percentage") {
    discount = Math.round((cartTotal * coupon.discount_value) / 100)
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount)
    }
  } else if (coupon.discount_type === "fixed") {
    discount = Math.min(cartTotal, coupon.discount_value)
  }
  return discount
}

export async function validateCoupon(code: string, cartTotal: number): Promise<{ valid: boolean; discount: number; coupon?: Coupon; error?: string }> {
  const coupons = await getActiveCoupons()
  const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase())
  
  if (!found) return { valid: false, discount: 0, error: `Coupon "${code}" is invalid or expired.` }
  
  if (cartTotal < found.min_order_value) {
    return { valid: false, discount: 0, error: `Coupon "${code}" requires a minimum order of ₹${found.min_order_value}.` }
  }
  
  return {
    valid: true,
    discount: calculateCouponDiscount(found, cartTotal),
    coupon: found
  }
}
