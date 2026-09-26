"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdmin } from "@/contexts/AdminContext"
import {
  LayoutDashboard,
  ShieldCheck,
  Layers,
  ShoppingBag,
  FolderTree,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database,
  X,
} from "lucide-react"

interface AdminSidebarProps {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const { stats, isSupabaseLive } = useAdmin()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      label: "Executive Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      badge: null,
      isStar: false,
    },
    {
      label: "Design Field Checker",
      href: "/admin/design-checker",
      icon: ShieldCheck,
      badge: stats.checklist.needsReview > 0 ? `${stats.checklist.needsReview} to review` : "100%",
      badgeVariant: stats.checklist.needsReview > 0 ? "warning" : "success",
      isStar: true,
    },
    {
      label: "Saree Catalog",
      href: "/admin/products",
      icon: Layers,
      badge: stats.totalSarees.toString(),
      badgeVariant: "neutral",
      isStar: false,
    },
    {
      label: "Order Fulfillment",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: stats.pendingOrdersCount > 0 ? `${stats.pendingOrdersCount} new` : null,
      badgeVariant: "accent",
      isStar: false,
    },
    {
      label: "Categories & Edits",
      href: "/admin/categories",
      icon: FolderTree,
      badge: null,
      isStar: false,
    },
    {
      label: "Hero Banners",
      href: "/admin/banners",
      icon: ImageIcon,
      badge: null,
      isStar: false,
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#181214] text-[#FAF7F2] border-r border-[#302127] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#302127] flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center gap-3.5 group overflow-hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#B88A3B] to-[#651F35] p-0.5 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#181214] rounded-[10px] flex items-center justify-center">
              <span className="font-serif text-lg font-bold text-[#D4AF37] tracking-wider">
                TS
              </span>
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <span className="font-serif text-base font-semibold tracking-wide text-[#FAF7F2] group-hover:text-[#D4AF37] transition-colors truncate">
                Trendy Sisters
              </span>
              <span className="text-[10px] tracking-widest uppercase font-medium text-[#D4AF37]/80">
                Haute Couture Portal
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-[#A89F91] hover:text-white p-1 rounded-lg"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick View Storefront Link */}
      <div className="px-4 py-3 border-b border-[#281b21]">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#651F35]/40 to-[#2A1720] hover:from-[#651F35]/70 hover:to-[#381D2A] border border-[#D4AF37]/30 text-xs text-[#E8DCC8] hover:text-white transition-all duration-200 group"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 group-hover:rotate-12 transition-transform" />
          {!collapsed && (
            <span className="flex-1 font-medium truncate">View Live Storefront</span>
          )}
          <ExternalLink className="w-3.5 h-3.5 text-[#A89F91] group-hover:text-white shrink-0 ml-auto" />
        </a>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                isActive
                  ? item.isStar
                    ? "bg-gradient-to-r from-[#651F35] to-[#451322] text-white shadow-lg shadow-[#651F35]/25 border border-[#D4AF37]/50"
                    : "bg-[#271920] text-[#FAF7F2] border border-[#D4AF37]/30 shadow-sm"
                  : item.isStar
                  ? "text-[#FAF7F2] hover:bg-[#25171E] border border-dashed border-[#D4AF37]/30"
                  : "text-[#B8AEA2] hover:text-[#FAF7F2] hover:bg-[#201419]"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div
                className={`p-1 rounded-lg shrink-0 transition-colors ${
                  isActive
                    ? item.isStar
                      ? "bg-[#D4AF37] text-[#181214]"
                      : "text-[#D4AF37]"
                    : item.isStar
                    ? "text-[#D4AF37] group-hover:scale-110 transition-transform"
                    : "text-[#9F9387] group-hover:text-[#FAF7F2]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {/* Badge */}
              {!collapsed && item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 tracking-wide ${
                    item.badgeVariant === "warning"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : item.badgeVariant === "accent"
                      ? "bg-[#651F35] text-white border border-[#D4AF37]/40"
                      : item.badgeVariant === "success"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/10 text-[#D8CFBC]"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed dot indicator */}
              {collapsed && isActive && (
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Status & Info */}
      <div className="p-4 border-t border-[#302127] space-y-3">
        {/* Database Status */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#20151A] border border-[#33222A]">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSupabaseLive ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isSupabaseLive ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </span>
          <Database className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-medium text-[#FAF7F2] truncate">
                {isSupabaseLive ? "Supabase Live Connected" : "Local Sync Active"}
              </span>
              <span className="text-[9px] text-[#A89F91]">
                PostgreSQL · Real-time
              </span>
            </div>
          )}
        </div>

        {/* User Card & Collapse Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#651F35] to-[#B88A3B] p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full bg-[#181214] flex items-center justify-center text-xs font-semibold text-[#D4AF37]">
                AD
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#FAF7F2] truncate">
                  Admin Merchandiser
                </span>
                <span className="text-[10px] text-[#9A8F82] truncate">
                  QC & Design Audit Lead
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex text-[#A89F91] hover:text-[#FAF7F2] p-1.5 rounded-lg hover:bg-[#25171E] transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0 z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden transition-transform duration-300 ease-in-out shadow-2xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  )
}
