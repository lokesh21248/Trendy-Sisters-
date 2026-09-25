import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Package, ChevronRight, Truck, MapPin } from "lucide-react"
import { getSafeImageUrl } from "@/lib/image-utils"

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

const statusColors: Record<string, { bg: string, text: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E" },
  confirmed: { bg: "#DBEAFE", text: "#1E40AF" },
  processing: { bg: "#E0E7FF", text: "#3730A3" },
  shipped: { bg: "#FEF08A", text: "#854D0E" },
  out_for_delivery: { bg: "#FDF4FF", text: "#86198F" },
  delivered: { bg: "#D1FAE5", text: "#065F46" },
  cancelled: { bg: "#FEE2E2", text: "#B91C1C" },
  returned: { bg: "#F3F4F6", text: "#374151" },
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (name, product_images(image_url))
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const typedOrders = orders as any[];

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="p-2 -ml-2 rounded-full hover:bg-ivory-dark transition-colors">
            <ArrowLeft size={20} className="text-charcoal" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-charcoal">My Orders</h1>
        </div>

        {/* Orders List */}
        {!typedOrders || typedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[var(--border)] shadow-sm">
            <div className="w-20 h-20 bg-ivory-dark rounded-full flex items-center justify-center mx-auto mb-5">
              <Package size={32} className="text-burgundy opacity-50" />
            </div>
            <h2 className="font-serif text-xl font-bold text-charcoal mb-2">No orders yet</h2>
            <p className="text-sm text-[#9B8A7A] mb-6">Looks like you haven&apos;t made your first purchase.</p>
            <Link href="/shop" className="btn-primary inline-flex">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4 lg:space-y-6">
            {typedOrders.map((order) => {
              const statusColor = statusColors[order.status] || { bg: "#F3F4F6", text: "#374151" }
              const firstItem = order.order_items[0]
              const otherItemsCount = order.order_items.length - 1
              const primaryImg = firstItem?.products?.product_images?.[0]?.image_url

              return (
                <div key={order.id} className="bg-white rounded-2xl p-5 lg:p-6 border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-5 border-b border-[var(--border)]">
                    <div>
                      <div className="text-xs text-[#9B8A7A] mb-1">
                        Order ID: <span className="font-mono text-charcoal font-medium">{order.id.split('-')[0].toUpperCase()}</span>
                      </div>
                      <div className="text-sm text-charcoal font-medium">
                        Placed on {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-ivory-dark flex-shrink-0">
                      {primaryImg ? (
                        <Image src={getSafeImageUrl(primaryImg)} alt="Product" fill className="object-cover" sizes="64px" />
                      ) : (
                        <Package size={24} className="absolute inset-0 m-auto text-burgundy opacity-30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-charcoal line-clamp-2 mb-1">
                        {firstItem?.products?.name || "Product Name Unavailable"}
                      </h4>
                      <p className="text-xs text-[#9B8A7A] mb-1">
                        Qty: {firstItem?.quantity} • {formatPrice(firstItem?.price)}
                      </p>
                      {otherItemsCount > 0 && (
                        <p className="text-xs font-medium text-burgundy">
                          + {otherItemsCount} more item{otherItemsCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-[#9B8A7A] mb-0.5">Order Total</div>
                      <div className="font-bold text-base text-burgundy">{formatPrice(order.total)}</div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex gap-3">
                    <Link 
                      href={`/account/orders/${order.id}/tracking`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-burgundy hover:bg-burgundy-dark transition-colors"
                    >
                      <Truck size={16} />
                      Track Order
                    </Link>
                    <Link 
                      href={`/account/orders/${order.id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal border border-[var(--border)] hover:bg-ivory transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
