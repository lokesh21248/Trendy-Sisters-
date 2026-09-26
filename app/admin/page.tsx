"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useAdmin } from "@/contexts/AdminContext"
import {
  Shirt,
  ShieldCheck,
  ShoppingBag,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  Palette,
  Camera,
  Tag,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { OrderStatus } from "@/types/admin"

export default function AdminDashboardPage() {
  const { products, orders, stats, updateOrderStatus, setSelectedAuditProductId, setAuditFilter } =
    useAdmin()

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const checklistItems = [
    {
      title: "Missing Fabric Material",
      count: stats.checklist.missingFabric,
      filter: "missing-fabric" as const,
      icon: Layers,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description: "Sarees without specified weave (Silk, Kanjivaram, Cotton)",
    },
    {
      title: "Missing Color Swatches",
      count: stats.checklist.missingColor,
      filter: "missing-color" as const,
      icon: Palette,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      description: "Sarees lacking primary shade & swatch hex mapping",
    },
    {
      title: "Missing Occasion Tags",
      count: stats.checklist.missingOccasion,
      filter: "missing-occasion" as const,
      icon: Tag,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "Sarees unclassified for Wedding, Bridal, Festive, etc.",
    },
    {
      title: "Incomplete Gallery (< 2 angles)",
      count: stats.checklist.missingImages,
      filter: "missing-images" as const,
      icon: Camera,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      description: "Requires at least primary drape + pallu/border detail",
    },
    {
      title: "Low Inventory Alert (< 10 units)",
      count: stats.checklist.lowStock,
      filter: "low-stock" as const,
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-50 border-orange-200",
      description: "Sarees nearing stockout or unassigned inventory units",
    },
    {
      title: "Needs Audit Review (< 100%)",
      count: stats.checklist.needsReview,
      filter: "review" as const,
      icon: AlertCircle,
      color: "text-[#651F35] bg-[#651F35]/10 border-[#651F35]/20",
      description: "Pending full quality sign-off before storefront promotion",
    },
  ]

  const recentOrders = orders.slice(0, 5)
  const recentSarees = products.slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181214] via-[#2A161F] to-[#451424] text-white p-6 md:p-8 border border-[#D4AF37]/30 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trendy Sisters Haute Couture Admin</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#FFF9EF]">
              Welcome back, Lead Merchandiser
            </h2>
            <p className="text-sm text-[#D8CFBC] leading-relaxed">
              Your saree catalog health is currently at{" "}
              <strong className="text-[#D4AF37] font-semibold">
                {stats.designHealthScore}%
              </strong>
              . Audit pending fabric specs, palette swatches, and high-res angles to ensure supreme customer drape fidelity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/design-checker"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B88A3B] hover:from-[#E5C158] hover:to-[#C99B4C] text-[#181214] font-semibold text-sm shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-[#181214]" />
              <span>Launch Design Field Checker</span>
              <ArrowRight className="w-4 h-4 text-[#181214]" />
            </Link>

            <Link
              href="/admin/products?action=new"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/20 transition-all"
            >
              <span>Add New Saree</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Sarees */}
        <div className="bg-white rounded-xl p-5 border border-[#E8DCC8] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#8B6E32] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Sarees
            </span>
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-[#651F35]">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#25201D]">
            {stats.totalSarees}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6B5E51]">
            <span className="font-semibold text-emerald-600">
              {stats.activeCatalog} Live
            </span>
            <span>·</span>
            <span>{stats.totalSarees - stats.activeCatalog} Drafts</span>
          </div>
        </div>

        {/* Metric 2: Active Catalog */}
        <div className="bg-white rounded-xl p-5 border border-[#E8DCC8] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#8B6E32] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Catalog
            </span>
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#25201D]">
            {stats.activePercentage}%
          </div>
          <div className="mt-2 text-xs text-[#6B5E51] truncate">
            {stats.activeCatalog} of {stats.totalSarees} visible in store
          </div>
        </div>

        {/* Metric 3: Design Health Score */}
        <div className="bg-white rounded-xl p-5 border border-[#E8DCC8] shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8B6E32] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Design Health
            </span>
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-[#B88A3B]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="font-serif text-2xl font-bold text-[#651F35]">
              {stats.designHealthScore}%
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              {stats.checklist.complete} / {stats.totalSarees} Ready
            </span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="w-full bg-[#FAF7F2] h-1.5 rounded-full mt-3 overflow-hidden border border-[#E8DCC8]">
            <div
              className="h-full bg-gradient-to-r from-[#B88A3B] to-[#651F35] rounded-full transition-all duration-500"
              style={{ width: `${stats.designHealthScore}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Total Orders */}
        <div className="bg-white rounded-xl p-5 border border-[#E8DCC8] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#8B6E32] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Orders
            </span>
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-indigo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#25201D]">
            {stats.totalOrders}
          </div>
          <div className="mt-2 text-xs text-[#6B5E51]">
            <span className="font-semibold text-amber-600">
              {stats.pendingOrdersCount} awaiting dispatch
            </span>
          </div>
        </div>

        {/* Metric 5: Store Revenue */}
        <div className="bg-white rounded-xl p-5 border border-[#E8DCC8] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#8B6E32] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Store Revenue
            </span>
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-[#651F35]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#25201D]">
            {formatPrice(stats.storeRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Paid fulfillment orders</span>
          </div>
        </div>
      </div>

      {/* Star Section: Design Field Health Checklist (1-Click Audit Links) */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6D8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#B88A3B]" />
              <h3 className="font-serif text-lg font-bold text-[#25201D]">
                Design Field Health Checklist
              </h3>
            </div>
            <p className="text-xs text-[#6B5E51] mt-1">
              Click any checklist card below to immediately filter & inspect sarees in the Design Field Checker.
            </p>
          </div>

          <Link
            href="/admin/design-checker"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#651F35] hover:text-[#4A1627] hover:underline"
          >
            <span>Open Complete Quality Control Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {checklistItems.map((item) => {
            const Icon = item.icon
            const hasIssue = item.count > 0

            return (
              <Link
                key={item.title}
                href={`/admin/design-checker?filter=${item.filter}`}
                onClick={() => setAuditFilter(item.filter)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 group ${
                  hasIssue
                    ? "bg-[#FAF7F2] hover:bg-white hover:border-[#D4AF37] hover:shadow-md"
                    : "bg-white/60 opacity-80 border-gray-200 hover:opacity-100"
                }`}
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-[#25201D] group-hover:text-[#651F35] transition-colors truncate">
                      {item.title}
                    </h4>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        hasIssue
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {item.count} {item.count === 1 ? "saree" : "sarees"}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A6E62] mt-1 leading-snug">
                    {item.description}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-[#B88A3B] group-hover:translate-x-0.5 transition-transform">
                    <span>Audit Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Split Section: Recent Orders & Recently Added Sarees */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Orders Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D8]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#25201D]">
                Recent Customer Orders
              </h3>
              <p className="text-xs text-[#6B5E51]">
                Real-time fulfillment queue & order delivery status
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#651F35] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#25201D]">
              <thead className="text-[11px] uppercase tracking-wider text-[#8B6E32] bg-[#FAF7F2] border-y border-[#E8DCC8]">
                <tr>
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E6D8]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#651F35]">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#25201D]">
                        {order.customer_name}
                      </div>
                      <div className="text-[11px] text-[#8C8074]">
                        {order.address.city}, {order.address.state}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          order.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {order.payment_method} · {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="text-[11px] font-semibold rounded-lg px-2 py-1 bg-white border border-[#D8CFBC] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recently Added Sarees (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D8]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#25201D]">
                Catalog Saree Quality
              </h3>
              <p className="text-xs text-[#6B5E51]">
                Completeness badges & audit triggers
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-[#651F35] hover:underline flex items-center gap-1"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentSarees.map((saree) => {
              const score = saree.completeness.score
              const is100 = score === 100
              const primaryImg =
                saree.product_images?.find((img) => img.is_primary)?.image_url ||
                saree.product_images?.[0]?.image_url ||
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80"

              return (
                <div
                  key={saree.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-white border border-[#E8DCC8] hover:border-[#D4AF37] transition-all group"
                >
                  <div className="w-12 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-[#E8DCC8] relative">
                    <img
                      src={primaryImg}
                      alt={saree.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-[#25201D] truncate">
                        {saree.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#7A6E62]">
                      <span>{saree.fabric || "No Fabric"}</span>
                      <span>·</span>
                      <span className="font-medium text-[#25201D]">
                        ₹{saree.price?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        is100
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : score >= 70
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {score}% QC
                    </span>

                    <Link
                      href={`/admin/design-checker?id=${saree.id}`}
                      onClick={() => setSelectedAuditProductId(saree.id)}
                      className="text-[10px] font-semibold text-[#651F35] hover:text-[#8B2D47] flex items-center gap-0.5 group-hover:underline"
                    >
                      <span>Audit</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
