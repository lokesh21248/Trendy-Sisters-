"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingBag, Heart } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Show } from "@clerk/nextjs"
import { CustomUserMenu } from "./CustomUserMenu"

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
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 w-full min-w-0 box-border">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0"
            style={{ borderColor: "var(--gold)", backgroundColor: "var(--ivory)" }}
          >
            <Image
              src="/logo.jpg"
              alt="Trendy Sisters"
              width={56}
              height={56}
              className="object-contain"
              quality={100}
              unoptimized={true}
              onError={(e) => {
                const t = e.target as HTMLImageElement
                t.style.display = "none"
              }}
            />
          </div>
          <div className="min-w-0">
            <div
              className="font-serif font-bold text-sm sm:text-[15px] leading-tight truncate"
              style={{ color: "var(--burgundy)" }}
            >
              Trendy Sisters
            </div>
            <div className="text-[9px] sm:text-[10px] leading-tight truncate hidden min-[360px]:block" style={{ color: "var(--gold)" }}>
              Three Sisters, One Dream
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Auth controls */}
          <Show when="signed-out">
            <Link
              href="/auth/login"
              className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-all shrink-0"
              style={{ borderColor: "var(--burgundy)", color: "var(--burgundy)" }}
            >
              Sign In
            </Link>
          </Show>
          <Show when="signed-in">
            <CustomUserMenu size="sm" />
          </Show>

          <Link
            href="/wishlist"
            className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0"
            style={{ color: "var(--charcoal)" }}
            aria-label="Wishlist"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: "var(--gold)", fontSize: 9 }}
              >
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0"
            style={{ color: "var(--charcoal)" }}
            aria-label="Cart"
          >
            <ShoppingBag size={19} />
            {itemCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: "var(--burgundy)", fontSize: 9 }}
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 sm:px-4 pb-2.5 sm:pb-3 w-full box-border">
        <form onSubmit={handleSearch} className="relative w-full">
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
            className="w-full max-w-full pl-9 pr-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm outline-none box-border"
            style={{
              backgroundColor: "var(--ivory-dark)",
              border: "1px solid var(--border)",
              color: "var(--charcoal)",
            }}
          />
        </form>
      </div>
    </header>
  )
}
