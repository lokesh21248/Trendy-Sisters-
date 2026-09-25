"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import {
  MapPin, Heart, ShoppingBag, User, ChevronDown,
  Package, LogOut, Settings, Bookmark, Bell, CreditCard
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { SearchBar } from "./SearchBar"
import type { Profile } from "@/types"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
]

export function Header() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const { wishlistIds } = useWishlist()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from("profiles").select("*").eq("id", user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
    })
    return () => listener?.subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setAccountOpen(false)
    window.location.href = "/"
  }

  const wishlistCount = wishlistIds.size

  return (
    <header
      style={{ backgroundColor: "var(--ivory)", borderBottom: "1px solid var(--border)" }}
      className="sticky top-0 z-50 shadow-sm"
    >
      {/* Top announcement bar */}
      <div
        style={{ backgroundColor: "var(--burgundy)", color: "white" }}
        className="w-full text-center py-2 text-xs font-medium tracking-wide"
      >
        🎉 Free shipping on orders above ₹999 &nbsp;|&nbsp; Use code{" "}
        <span style={{ color: "var(--gold-light)" }} className="font-bold">
          TRENDY10
        </span>{" "}
        for 10% off your first order
      </div>

      {/* Main header */}
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center"
                style={{ borderColor: "var(--gold)", backgroundColor: "var(--ivory)" }}
              >
                <Image
                  src="/logo.png"
                  alt="Trendy Sisters"
                  width={56}
                  height={56}
                  className="object-contain"
                  onError={(e) => {
                    // Fallback if logo not found
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
                {/* Fallback text logo */}
                <span
                  className="font-serif font-bold text-xs text-center leading-tight hidden"
                  style={{ color: "var(--burgundy)" }}
                >
                  TS
                </span>
              </div>
              <div>
                <div
                  className="font-serif font-bold text-xl leading-tight"
                  style={{ color: "var(--burgundy)" }}
                >
                  Trendy Sisters
                </div>
                <div className="text-xs" style={{ color: "var(--gold)" }}>
                  Three Sisters, One Dream
                </div>
              </div>
            </div>
          </Link>

          {/* Navigation pills */}
          <nav className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-pill ${isActive ? "nav-pill-active" : "nav-pill-inactive"}`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Location */}
            <button
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-ivory-dark transition-colors text-sm"
              style={{ color: "var(--charcoal)" }}
            >
              <MapPin size={16} style={{ color: "var(--burgundy)" }} />
              <span className="font-medium">India</span>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-full hover:bg-ivory-dark transition-colors"
              title="Wishlist"
            >
              <Heart size={20} style={{ color: "var(--charcoal)" }} />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: "var(--burgundy)", width: 18, height: 18 }}
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-4 py-2 rounded-full transition-all"
              style={{ backgroundColor: "var(--burgundy)", color: "white" }}
            >
              <ShoppingBag size={18} />
              <span className="font-semibold text-sm hidden sm:block">Cart</span>
              {itemCount > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: "var(--gold)", color: "white" }}
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* Account dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-1.5 p-2.5 rounded-full hover:bg-ivory-dark transition-colors"
                style={{ color: "var(--charcoal)" }}
              >
                <User size={20} />
                <ChevronDown
                  size={14}
                  className="transition-transform duration-200"
                  style={{ transform: accountOpen ? "rotate(180deg)" : "rotate(0)" }}
                />
              </button>

              {/* Dropdown */}
              {accountOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden shadow-2xl animate-fade-in z-50"
                  style={{ border: "1px solid var(--border)", backgroundColor: "white" }}
                >
                  {user ? (
                    <>
                      {/* Profile header */}
                      <div
                        className="p-4 flex items-center gap-3"
                        style={{ background: "linear-gradient(135deg, var(--burgundy), var(--burgundy-light))" }}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: "var(--gold)" }}
                        >
                          {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            {profile?.full_name || "My Account"}
                          </div>
                          <div className="text-white/70 text-xs">{profile?.phone || user.email}</div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-2">
                        {[
                          { icon: User, label: "My Account", desc: "Profile & settings", href: "/account" },
                          { icon: Package, label: "My Orders", desc: "View current & previous orders", href: "/account/orders" },
                          { icon: MapPin, label: "Addresses", desc: "Home • Office • Add new", href: "/account/addresses" },
                          { icon: Heart, label: "Wishlist", desc: `${wishlistCount} saved items`, href: "/wishlist" },
                          { icon: Bell, label: "Notifications", desc: "Order updates & offers", href: "/account/notifications" },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-ivory transition-colors"
                            onClick={() => setAccountOpen(false)}
                          >
                            <item.icon size={18} style={{ color: "var(--burgundy)" }} />
                            <div>
                              <div className="text-sm font-medium" style={{ color: "var(--charcoal)" }}>
                                {item.label}
                              </div>
                              <div className="text-xs" style={{ color: "#8B7355" }}>{item.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <div className="px-2 pb-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-red-600"
                        >
                          <LogOut size={18} />
                          <span className="text-sm font-medium">Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4">
                      <p className="text-sm mb-4" style={{ color: "var(--charcoal)" }}>
                        Sign in to view your orders, wishlist and more.
                      </p>
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/auth/login"
                          className="btn-primary text-center block rounded-xl py-2.5 text-sm font-semibold"
                          onClick={() => setAccountOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="btn-secondary text-center block rounded-xl py-2.5 text-sm font-semibold"
                          onClick={() => setAccountOpen(false)}
                        >
                          Create Account
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-2xl mx-auto pb-4">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}
