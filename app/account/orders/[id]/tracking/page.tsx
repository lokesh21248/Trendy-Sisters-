import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Circle, Package, Truck, Home } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default async function TrackingPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  const typedOrder = order as any;
  if (!typedOrder) notFound()

  // Simplified tracking timeline based on current status
  const statuses = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"]
  const currentIndex = statuses.indexOf(typedOrder.status)
  
  const timeline = [
    { key: "confirmed", label: "Order Confirmed", icon: Package, date: typedOrder.created_at },
    { key: "processing", label: "Preparing to Ship", icon: Package, date: typedOrder.updated_at }, // Fake date for demo
    { key: "shipped", label: "Shipped", icon: Truck, date: null },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Truck, date: null },
    { key: "delivered", label: "Delivered", icon: Home, date: null },
  ]

  const isActive = (key: string) => statuses.indexOf(key) <= currentIndex
  const isCurrent = (key: string) => statuses.indexOf(key) === currentIndex

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account/orders" className="p-2 -ml-2 rounded-full hover:bg-ivory-dark transition-colors">
            <ArrowLeft size={20} className="text-charcoal" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Track Order</h1>
        </div>

        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[var(--border)] shadow-sm">
          <div className="mb-8">
            <p className="text-sm text-[#9B8A7A] mb-1">Order ID</p>
            <p className="font-mono text-lg font-bold text-charcoal">{typedOrder.id.split('-')[0].toUpperCase()}</p>
          </div>

          <div className="relative pl-4 space-y-8">
            {/* Timeline Line */}
            <div 
              className="absolute left-7 top-4 bottom-4 w-0.5 bg-[var(--border)]" 
              style={{ zIndex: 0 }}
            />

            {timeline.map((step, idx) => {
              const active = isActive(step.key)
              const current = isCurrent(step.key)
              
              return (
                <div key={step.key} className="relative flex gap-6" style={{ zIndex: 1 }}>
                  {/* Icon Node */}
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ 
                      backgroundColor: active ? "var(--burgundy)" : "white",
                      border: active ? "none" : "2px solid var(--border)"
                    }}
                  >
                    {active ? (
                      <CheckCircle2 size={16} color="white" />
                    ) : (
                      <Circle size={10} color="var(--border)" fill="var(--border)" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 
                      className={`font-semibold text-base mb-1 ${active ? "text-charcoal" : "text-[#9B8A7A]"}`}
                    >
                      {step.label}
                    </h3>
                    {current && (
                      <p className="text-sm text-burgundy font-medium mb-1">
                        Currently here
                      </p>
                    )}
                    {active && step.date && (
                      <p className="text-xs text-[#9B8A7A]">
                        {new Date(step.date).toLocaleDateString('en-IN', {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: 'numeric', minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
