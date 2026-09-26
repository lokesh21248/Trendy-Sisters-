"use client"

import React, { useState, useMemo } from "react"
import { useAdmin } from "@/contexts/AdminContext"
import {
  ShoppingBag,
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  AlertCircle,
  Calendar,
} from "lucide-react"
import { OrderStatus, AdminOrder } from "@/types/admin"

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useAdmin()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchNumber = o.order_number?.toLowerCase().includes(q)
        const matchCustomer = o.customer_name?.toLowerCase().includes(q)
        const matchCity = o.address?.city?.toLowerCase().includes(q)
        if (!matchNumber && !matchCustomer && !matchCity) return false
      }
      if (statusFilter !== "all" && o.status !== statusFilter) return false
      return true
    })
  }, [orders, search, statusFilter])

  const statusColors: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
    processing: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
    shipped: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
    out_for_delivery: { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-200" },
    delivered: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
    cancelled: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
    returned: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  }

  const allStatuses: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#25201D]">
            Order Fulfillment & Logistics
          </h2>
          <p className="text-xs text-[#6B5E51] mt-1">
            Dispatch queue, tracking management, customer addresses, and payment reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#E8DCC8] shadow-xs text-xs font-semibold text-[#651F35]">
            <span>{orders.length} Total Orders</span>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#E8DCC8] shadow-xs text-xs font-semibold text-emerald-700">
            <span>
              {orders.filter((o) => o.status === "delivered").length} Fulfilled
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DCC8] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8074] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number (TS-...), customer name, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] placeholder-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#651F35] text-white"
                : "bg-[#FAF7F2] text-[#6B5E51] hover:bg-[#F5EDD9]"
            }`}
          >
            All Orders ({orders.length})
          </button>
          {allStatuses.map((st) => {
            const count = orders.filter((o) => o.status === st).length
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#651F35] text-white"
                    : "bg-[#FAF7F2] text-[#6B5E51] hover:bg-[#F5EDD9]"
                }`}
              >
                {st.replace(/_/g, " ")} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#25201D]">
            <thead className="text-[11px] uppercase tracking-wider text-[#8B6E32] bg-[#FAF7F2] border-b border-[#E8DCC8]">
              <tr>
                <th className="py-3 px-4">Order Ref & Date</th>
                <th className="py-3 px-3">Customer & Destination</th>
                <th className="py-3 px-3">Saree Items</th>
                <th className="py-3 px-3">Financials</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8]">
              {filteredOrders.map((order) => {
                const color = statusColors[order.status] || statusColors.pending
                const dateStr = new Date(order.created_at).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF7F2]/60 transition-colors"
                  >
                    {/* Order Ref & Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-xs text-[#651F35]">
                        {order.order_number}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#8C8074] mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </div>
                    </td>

                    {/* Customer & Destination */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-xs text-[#25201D]">
                        {order.customer_name}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#6B5E51] mt-0.5">
                        <MapPin className="w-3 h-3 text-[#B88A3B]" />
                        <span>
                          {order.address.city}, {order.address.state} (
                          {order.address.pincode})
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8C8074] mt-0.5">
                        {order.customer_phone}
                      </div>
                    </td>

                    {/* Saree Items */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1 max-w-[220px]">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2"
                          >
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt=""
                                className="w-6 h-8 rounded object-cover border border-[#E8DCC8] shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs text-[#25201D] font-medium truncate">
                                {item.product_name}
                              </div>
                              <div className="text-[10px] text-[#8C8074]">
                                Qty: {item.quantity} · ₹
                                {item.price.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-xs text-[#25201D]">
                        {formatPrice(order.total)}
                      </div>
                      {order.discount > 0 && (
                        <div className="text-[10px] text-emerald-700">
                          Discount: -{formatPrice(order.discount)}
                        </div>
                      )}
                      <div className="text-[10px] text-[#8C8074]">
                        Shipping:{" "}
                        {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
                      </div>
                    </td>

                    {/* Payment Badge */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.payment_status === "paid"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : order.payment_status === "failed"
                              ? "bg-rose-50 text-rose-800 border border-rose-300"
                              : "bg-amber-50 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {order.payment_status.toUpperCase()}
                        </span>
                        <div className="text-[10px] font-medium text-[#6B5E51]">
                          {order.payment_method}
                        </div>
                      </div>
                    </td>

                    {/* Fulfillment Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(
                              order.id,
                              e.target.value as OrderStatus
                            )
                          }
                          className={`text-xs font-bold rounded-xl px-3 py-1.5 border focus:ring-1 focus:ring-[#D4AF37] focus:outline-none cursor-pointer ${color.bg} ${color.text} ${color.border}`}
                        >
                          {allStatuses.map((st) => (
                            <option key={st} value={st}>
                              {st.replace(/_/g, " ").toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {order.notes && (
                        <div className="text-[10px] text-[#8C8074] italic mt-1 max-w-[200px] truncate" title={order.notes}>
                          Note: {order.notes}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
