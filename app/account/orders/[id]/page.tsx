import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Calendar, CheckCircle2 } from "lucide-react"
import { getSafeImageUrl } from "@/lib/image-utils"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E" },
  confirmed: { bg: "#DBEAFE", text: "#1E40AF" },
  processing: { bg: "#E0E7FF", text: "#3730A3" },
  shipped: { bg: "#FEF08A", text: "#854D0E" },
  out_for_delivery: { bg: "#FDF4FF", text: "#86198F" },
  delivered: { bg: "#D1FAE5", text: "#065F46" },
  cancelled: { bg: "#FEE2E2", text: "#B91C1C" },
  returned: { bg: "#F3F4F6", text: "#374151" },
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (name, slug, product_images(image_url))
      )
    `)
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  const typedOrder = order as any
  if (!typedOrder) notFound()

  const statusColor = statusColors[typedOrder.status] || { bg: "#F3F4F6", text: "#374151" }

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-12">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/account/orders" className="p-2 -ml-2 rounded-full hover:bg-ivory-dark transition-colors">
              <ArrowLeft size={20} className="text-charcoal" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl font-bold text-charcoal">Order Details</h1>
              <p className="text-xs text-[#9B8A7A]">
                Order #<span className="font-mono font-medium">{typedOrder.id.split("-")[0].toUpperCase()}</span>
              </p>
            </div>
          </div>

          <Link
            href={`/account/orders/${typedOrder.id}/tracking`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-burgundy hover:bg-burgundy-dark transition-colors"
          >
            <Truck size={16} />
            Track Order
          </Link>
        </div>

        {/* Status card */}
        <div className="bg-white rounded-3xl p-6 lg:p-7 border border-[var(--border)] shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
            >
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-lg capitalize text-charcoal">
                  Status: {typedOrder.status.replace(/_/g, " ")}
                </h2>
                <span
                  className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                >
                  {typedOrder.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-[#9B8A7A] mt-1 flex items-center gap-1.5">
                <Calendar size={13} /> Placed on {formatDate(typedOrder.created_at)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-[#9B8A7A]">Total Amount</div>
            <div className="text-2xl font-serif font-bold text-burgundy">
              {formatPrice(typedOrder.total)}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm">
              <h3 className="font-serif text-lg font-bold text-charcoal mb-4">
                Items in Order ({typedOrder.order_items?.length || 0})
              </h3>
              <div className="divide-y divide-[var(--border)]">
                {typedOrder.order_items?.map((item: any) => {
                  const img = item.products?.product_images?.[0]?.image_url
                  return (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-ivory-dark flex-shrink-0 border border-[var(--border)]">
                        {img ? (
                          <Image
                            src={getSafeImageUrl(img)}
                            alt={item.products?.name || "Product"}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <Package size={24} className="absolute inset-0 m-auto text-burgundy opacity-30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-charcoal line-clamp-2">
                          {item.products?.name || "Saree Product"}
                        </h4>
                        <p className="text-xs text-[#9B8A7A] mt-1">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="font-semibold text-sm text-charcoal text-right">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Payment & Shipping information */}
            <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm grid sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-charcoal font-semibold text-sm mb-2">
                  <CreditCard size={16} className="text-burgundy" />
                  Payment Details
                </div>
                <div className="text-xs text-[#9B8A7A] space-y-1">
                  <p>
                    Method: <span className="font-medium text-charcoal capitalize">{typedOrder.payment_method?.replace(/_/g, " ") || "Cash on Delivery"}</span>
                  </p>
                  <p>
                    Payment Status: <span className="font-medium text-charcoal capitalize">{typedOrder.payment_status || "Pending"}</span>
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-charcoal font-semibold text-sm mb-2">
                  <MapPin size={16} className="text-burgundy" />
                  Shipping Destination
                </div>
                <div className="text-xs text-[#9B8A7A] space-y-1">
                  <p className="font-medium text-charcoal">Delivery Address on File</p>
                  <p>Standard Insured Delivery (3-5 business days)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm">
              <h3 className="font-serif text-base font-bold text-charcoal mb-4">
                Price Breakdown
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#9B8A7A]">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-charcoal">{formatPrice(typedOrder.subtotal)}</span>
                </div>
                {typedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount Applied</span>
                    <span className="font-medium">-{formatPrice(typedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#9B8A7A]">
                  <span>Shipping & Delivery</span>
                  <span className="font-medium text-charcoal">
                    {typedOrder.shipping === 0 ? "FREE" : formatPrice(typedOrder.shipping)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[var(--border)] flex justify-between font-bold text-base text-charcoal">
                  <span>Total Paid</span>
                  <span className="text-burgundy font-serif">{formatPrice(typedOrder.total)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <CheckCircle2 size={14} />
                  Safe & Secure Checkout
                </div>
                <div className="flex items-center gap-2 text-xs text-[#9B8A7A]">
                  <Truck size={14} />
                  Free 7-Day Easy Return Policy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
