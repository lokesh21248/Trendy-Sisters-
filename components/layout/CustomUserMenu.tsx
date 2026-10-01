"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import {
  User,
  Package,
  MapPin,
  Heart,
  Tag,
  CreditCard,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react"

interface Props {
  size?: "sm" | "md"
}

export function CustomUserMenu({ size = "md" }: Props) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (!user) return null

  const metaFullName =
    (user.unsafeMetadata?.fullName as string) ||
    (user.unsafeMetadata?.firstName as string) ||
    ""
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : metaFullName || user.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Shopper"
  const email = user.emailAddresses?.[0]?.emailAddress || ""
  const avatarUrl = user.imageUrl

  const menuItems = [
    {
      label: "Profile Information",
      href: "/account/profile",
      icon: User,
    },
    {
      label: "My Orders",
      href: "/account/orders",
      icon: Package,
    },
    {
      label: "My Addresses",
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
    },
    {
      label: "Coupons & Rewards",
      href: "/account/coupons",
      icon: Tag,
    },
    {
      label: "Payment Methods",
      href: "/account/payments",
      icon: CreditCard,
    },
    {
      label: "Notifications",
      href: "/account/notifications",
      icon: Bell,
    },
  ]

  const avatarSize = size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm"

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-black/5 transition-all focus:outline-none focus:ring-2 focus:ring-burgundy/20"
        aria-label="User Account Menu"
        aria-expanded={isOpen}
      >
        <div
          className={`${avatarSize} rounded-full overflow-hidden border border-[#B88A3B]/60 shadow-sm flex items-center justify-center font-bold text-white bg-burgundy flex-shrink-0 relative`}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="36px"
              unoptimized
            />
          ) : (
            displayName[0]?.toUpperCase() || "U"
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-[#9B8A7A] transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180 text-burgundy" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[var(--border)] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ boxShadow: "0 10px 40px rgba(43,43,43,0.12)" }}
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-[var(--border)] bg-gradient-to-br from-ivory/50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-[#B88A3B]/40 shadow-sm flex items-center justify-center font-bold text-white bg-burgundy flex-shrink-0 relative text-base">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="44px"
                    unoptimized
                  />
                ) : (
                  displayName[0]?.toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-charcoal truncate">{displayName}</p>
                <p className="text-xs text-[#9B8A7A] truncate">{email}</p>
              </div>
            </div>

            <Link
              href="/account/profile"
              className="mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-burgundy bg-burgundy/10 hover:bg-burgundy/15 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles size={13} />
              Manage Profile Information
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-charcoal hover:bg-ivory hover:text-burgundy transition-colors"
              >
                <item.icon size={16} className="text-[#9B8A7A] group-hover:text-burgundy" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Sign Out Action */}
          <div className="pt-1 mt-1 border-t border-[var(--border)] px-2">
            <button
              onClick={() => {
                setIsOpen(false)
                signOut(() => router.push("/"))
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
