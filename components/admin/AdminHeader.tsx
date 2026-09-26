"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdmin } from "@/contexts/AdminContext"
import {
  Menu,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

interface AdminHeaderProps {
  setMobileOpen: (open: boolean) => void
  onOpenAddModal?: () => void
}

export function AdminHeader({ setMobileOpen, onOpenAddModal }: AdminHeaderProps) {
  const pathname = usePathname()
  const { stats } = useAdmin()

  let pageTitle = "Executive Dashboard"
  let breadcrumb = "Overview"

  if (pathname === "/admin/design-checker") {
    pageTitle = "Design Field Checker & Audit Panel"
    breadcrumb = "Quality Control"
  } else if (pathname === "/admin/products") {
    pageTitle = "Saree Catalog Management"
    breadcrumb = "Inventory"
  } else if (pathname === "/admin/orders") {
    pageTitle = "Order Fulfillment & Logistics"
    breadcrumb = "Orders"
  } else if (pathname === "/admin/categories") {
    pageTitle = "Categories & Curated Edits"
    breadcrumb = "Merchandising"
  } else if (pathname === "/admin/banners") {
    pageTitle = "Hero Banners & Visual Campaigns"
    breadcrumb = "Marketing"
  }

  const healthScore = stats.designHealthScore
  const isHealthy = healthScore >= 85

  return (
    <header className="sticky top-0 z-20 w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DCC8] px-4 md:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Page Titles */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-lg bg-white border border-[#E8DCC8] text-[#25201D] hover:bg-[#F5EDD9] transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#8B6E32] uppercase tracking-wider">
            <span>Trendy Sisters Admin</span>
            <span>/</span>
            <span>{breadcrumb}</span>
          </div>
          <h1 className="font-serif text-lg md:text-xl font-bold text-[#25201D] tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Health Badge & Fast Actions */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Design Health Indicator Pill */}
        <Link
          href="/admin/design-checker"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8DCC8] shadow-xs hover:border-[#D4AF37] transition-all group"
          title="Click to open Design Field Checker"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"
            }`}
          />
          <ShieldCheck className="w-4 h-4 text-[#B88A3B] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-[#25201D]">
            Catalog Health:
          </span>
          <span
            className={`text-xs font-bold ${
              isHealthy ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {healthScore}%
          </span>
        </Link>

        {/* View Storefront Quick Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#651F35] bg-[#651F35]/10 hover:bg-[#651F35]/15 border border-[#651F35]/20 transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Add Saree Quick Action */}
        <Link
          href="/admin/products?action=new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#651F35] to-[#8B2D47] hover:from-[#52182A] hover:to-[#742339] shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add New Saree</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>
    </header>
  )
}
