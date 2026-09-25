"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid3X3, ShoppingBag, Package, User } from "lucide-react"
import { useCart } from "@/contexts/CartContext"

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Categories", href: "/categories", icon: Grid3X3 },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Account", href: "/account", icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        backgroundColor: "white",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -2px 16px rgba(37,32,29,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
        minHeight: 56,
      }}
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-all"
            style={{
              color: isActive ? "var(--burgundy)" : "#9B8A7A",
              minHeight: 56,
            }}
            aria-label={item.label}
          >
            {/* Active top bar */}
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full"
                style={{ backgroundColor: "var(--burgundy)" }}
              />
            )}

            {/* Icon with active background pill */}
            <span
              className="relative flex items-center justify-center w-8 h-8 rounded-full transition-all"
              style={{
                backgroundColor: isActive ? "rgba(101,31,53,0.08)" : "transparent",
              }}
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {item.label === "Cart" && itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ backgroundColor: "var(--burgundy)", fontSize: 9 }}
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </span>

            <span
              className="text-[10px] font-medium leading-none"
              style={{
                fontFamily: "Inter, sans-serif",
                color: isActive ? "var(--burgundy)" : "#9B8A7A",
              }}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
