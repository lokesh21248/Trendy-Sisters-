"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingBag, Heart } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { SignInButton, Show, UserButton } from "@clerk/nextjs"

export function MobileHeader() {
  const { itemCount } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const { wishlistIds } = useWishlist()
  const wishlistCount = wishlistIds.size

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: "var(--ivory)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 8px rgba(37,32,29,0.06)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between px-4 py-2.5 w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-center flex-shrink-0"
            style={{ borderColor: "var(--gold)", backgroundColor: "var(--ivory)" }}
          >
            <Image
              src="/logo.png"
              alt="Trendy Sisters"
              width={36}
              height={36}
              className="object-contain"
              onError={(e) => {
                const t = e.target as HTMLImageElement
                t.style.display = "none"
              }}
            />
          </div>
          <div>
            <div
              className="font-serif font-bold text-[15px] leading-tight"
              style={{ color: "var(--burgundy)" }}
            >
              Trendy Sisters
            </div>
            <div className="text-[10px] leading-tight" style={{ color: "var(--gold)" }}>
              Three Sisters, One Dream
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Clerk Auth controls */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                style={{ borderColor: "var(--burgundy)", color: "var(--burgundy)" }}
              >
                Sign In
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-7 h-7",
                },
              }}
            />
          </Show>

          <Link
            href="/wishlist"
            className="relative flex items-center justify-center w-10 h-10 rounded-full"
            style={{ color: "var(--charcoal)" }}
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: "var(--gold)", fontSize: 9 }}
              >
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center justify-center w-10 h-10 rounded-full"
            style={{ color: "var(--charcoal)" }}
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: "var(--burgundy)", fontSize: 9 }}
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3 w-full">
        <form onSubmit={handleSearch} className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--burgundy)" }}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sarees, silk, wedding wear…"
            className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm outline-none"
            style={{
              backgroundColor: "var(--ivory-dark)",
              border: "1px solid var(--border)",
              color: "var(--charcoal)",
              fontSize: 14,
            }}
          />
        </form>
      </div>
    </header>
  )
}
