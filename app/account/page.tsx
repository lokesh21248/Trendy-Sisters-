import { currentUser, auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Package, MapPin, Heart, Tag, CreditCard, Bell, ChevronRight, User } from "lucide-react"
import { SignOutButton } from "@clerk/nextjs"

export const dynamic = "force-dynamic"

export default async function AccountPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const user = await currentUser()
  const metaFullName =
    (user?.unsafeMetadata?.fullName as string) ||
    (user?.unsafeMetadata?.firstName as string) ||
    ""
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : metaFullName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Shopper"
  const email = user?.emailAddresses?.[0]?.emailAddress || ""
  const avatarUrl = user?.imageUrl

  const accountCards = [
    {
      href: "/account/profile",
      icon: User,
      title: "Profile Information",
      desc: "Personal details, phone & email",
    },
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
            background:
              "linear-gradient(135deg, var(--burgundy) 0%, var(--burgundy-light) 50%, var(--gold-dark) 100%)",
          }}
        >
          {/* Decorative circle */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-white translate-x-1/3 -translate-y-1/3" />

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5">
              <Link
                href="/account/profile"
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/20 text-white overflow-hidden bg-[#B88A3B]/40 hover:scale-105 transition-transform"
                title="Edit profile photo and details"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  displayName[0]?.toUpperCase() || "U"
                )}
              </Link>
              <div className="text-white">
                <h1 className="font-serif text-2xl lg:text-3xl font-bold mb-1">
                  Hello, {displayName}
                </h1>
                <p className="text-white/80 text-sm">{email}</p>
              </div>
            </div>

            <Link
              href="/account/profile"
              className="bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-2xl py-2.5 px-4 flex items-center gap-2.5 text-white transition-all border border-white/20 shadow-sm group"
            >
              <User size={16} className="text-white/90 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-white">Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid sm:grid-cols-2 gap-4 lg:gap-6 mb-8">
          {accountCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:scale-[1.02] group bg-white"
              style={{
                border: "1px solid var(--border)",
                boxShadow: "0 4px 20px var(--shadow)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-burgundy transition-colors"
                style={{ backgroundColor: "rgba(101,31,53,0.08)" }}
              >
                <card.icon
                  size={22}
                  className="text-burgundy group-hover:text-white transition-colors"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal mb-0.5">{card.title}</h3>
                <p className="text-xs" style={{ color: "#9B8A7A" }}>
                  {card.desc}
                </p>
              </div>
              <ChevronRight size={20} style={{ color: "#D5C4A1" }} />
            </Link>
          ))}
        </div>

        {/* Clerk Sign Out Button */}
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-red-600 bg-white hover:bg-red-50 transition-colors cursor-pointer"
            style={{ border: "1px solid var(--border)" }}
          >
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}
