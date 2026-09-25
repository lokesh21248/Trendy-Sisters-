import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Package, MapPin, Heart, Tag, CreditCard, Bell, ChevronRight, LogOut } from "lucide-react"

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const typedProfile = profile as any;

  const accountCards = [
    {
      href: "/account/orders",
      icon: Package,
      title: "My Orders",
      desc: "View current & previous orders",
    },
    {
      href: "/account/addresses",
      icon: MapPin,
      title: "My Addresses",
      desc: "Home • Office • Add new",
    },
    {
      href: "/wishlist",
      icon: Heart,
      title: "Wishlist",
      desc: "Saved products",
    },
    {
      href: "/account/coupons",
      icon: Tag,
      title: "Coupons & Rewards",
      desc: "Available discounts",
    },
    {
      href: "/account/payments",
      icon: CreditCard,
      title: "Payment Methods",
      desc: "Saved cards & UPI",
    },
    {
      href: "/account/notifications",
      icon: Bell,
      title: "Notifications",
      desc: "Order updates & offers",
    },
  ]

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        
        {/* Profile Header Card */}
        <div 
          className="relative overflow-hidden rounded-3xl p-6 lg:p-8 mb-8"
          style={{ 
            background: "linear-gradient(135deg, var(--burgundy) 0%, var(--burgundy-light) 50%, var(--gold-dark) 100%)",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-white translate-x-1/3 -translate-y-1/3" />
          
          <div className="relative z-10 flex items-center gap-5">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/20 text-white"
              style={{ backgroundColor: "rgba(184, 138, 59, 0.4)" }}
            >
              {typedProfile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="text-white">
              <h1 className="font-serif text-2xl lg:text-3xl font-bold mb-1">
                Hello, {typedProfile?.full_name || "Guest"}
              </h1>
              <p className="text-white/80 text-sm">
                {typedProfile?.phone || user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid sm:grid-cols-2 gap-4 lg:gap-6 mb-8">
          {accountCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:scale-[1.02] group bg-white"
              style={{ border: "1px solid var(--border)", boxShadow: "0 4px 20px var(--shadow)" }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-burgundy transition-colors"
                style={{ backgroundColor: "rgba(101,31,53,0.08)" }}
              >
                <card.icon size={22} className="text-burgundy group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal mb-0.5">{card.title}</h3>
                <p className="text-xs" style={{ color: "#9B8A7A" }}>{card.desc}</p>
              </div>
              <ChevronRight size={20} style={{ color: "#D5C4A1" }} />
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <form action="/auth/logout" method="POST">
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-red-600 bg-white hover:bg-red-50 transition-colors"
            style={{ border: "1px solid var(--border)" }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </form>

      </div>
    </div>
  )
}
