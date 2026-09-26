"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { MobileHeader } from "@/components/layout/MobileHeader"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { Footer } from "@/components/layout/Footer"

export function StoreLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  // For Admin Portal, do not render storefront consumer header/footer
  if (isAdmin) {
    return <div className="w-full min-h-screen bg-[#FDFBF7]">{children}</div>
  }

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block w-full">
        <Header />
      </div>
      {/* Mobile Header */}
      <div className="block md:hidden w-full">
        <MobileHeader />
      </div>

      <main className="w-full flex-1">{children}</main>

      <Footer />

      {/* Mobile Bottom Navigation */}
      <div className="block md:hidden">
        <MobileBottomNav />
      </div>
    </>
  )
}
