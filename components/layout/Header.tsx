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

import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs"

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user || null
      setUser(u)
      if (u) {
        supabase.from("profiles").select("*").eq("id", u.id).maybeSingle()
          .then(({ data }) => setProfile(data))
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user || null
      setUser(u)
      if (u) {
        supabase.from("profiles").select("*").eq("id", u.id).maybeSingle()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
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
                className="w-14 h-14 rounded-full border-2 flex items-center justify-center p-1 bg-white"
                style={{ borderColor: "var(--gold)" }}
              >
                <Image
                  src="/logo.png"
                  alt="Trendy Sisters"
                  width={56}
                  height={56}
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
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

            {/* Clerk Authentication Controls */}
            <div className="flex items-center gap-2">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all hover:bg-black/5"
                    style={{ borderColor: "var(--burgundy)", color: "var(--burgundy)" }}
                  >
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: "var(--burgundy)" }}
                  >
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>

              <Show when="signed-in">
                <div className="flex items-center gap-2 pl-1">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 border border-[#B88A3B]/40 shadow-sm",
                      },
                    }}
                  >
                    <UserButton.MenuItems>
                      <UserButton.Link
                        label="My Orders"
                        labelIcon={<Package size={15} />}
                        href="/account/orders"
                      />
                      <UserButton.Link
                        label="Wishlist"
                        labelIcon={<Heart size={15} />}
                        href="/wishlist"
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                </div>
              </Show>
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
