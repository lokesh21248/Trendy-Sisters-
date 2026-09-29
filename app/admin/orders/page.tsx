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
  X,
  Eye,
  Banknote,
  Send,
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
        const matchPhone = o.customer_phone?.toLowerCase().includes(q)
        if (!matchNumber && !matchCustomer && !matchCity && !matchPhone) return false
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
            Dispatch queue, Cash on Delivery collections, customer addresses, and fulfillment tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#E8DCC8] shadow-xs text-xs font-semibold text-[#651F35]">
            <span>{orders.length} Total Orders</span>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#E8DCC8] shadow-xs text-xs font-semibold text-amber-700">
            <span>
              {orders.filter((o) => o.payment_method === "Cash on Delivery").length} COD Orders
            </span>
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
            placeholder="Search by order number (TS-COD-...), customer name, phone, city..."
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
                <th className="py-3 px-3">Customer & Address</th>
                <th className="py-3 px-3">Saree Items</th>
                <th className="py-3 px-3">Financials</th>
                <th className="py-3 px-3">Payment / COD</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#8C8074]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const color = statusColors[order.status] || statusColors.pending
                  const isCOD = order.payment_method === "Cash on Delivery"
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs text-[#651F35]">
                            {order.order_number}
                          </span>
                          {isCOD && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              COD
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#8C8074] mt-0.5">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Customer & Destination */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-xs text-[#25201D]">
                          {order.customer_name}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#6B5E51] mt-0.5">
                          <MapPin className="w-3 h-3 text-[#B88A3B] shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {order.address?.city}, {order.address?.state} ({order.address?.pincode})
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8C8074] mt-0.5">
                          {order.customer_phone}
                        </div>
                      </td>

                      {/* Saree Items */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1 max-w-[200px]">
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

                      {/* Payment / COD Badge */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.payment_status === "paid"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                                : order.payment_status === "failed"
                                ? "bg-rose-50 text-rose-800 border border-rose-300"
                                : isCOD
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-amber-50 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {order.payment_status === "pending" && isCOD
                              ? "COLLECT ON ARRIVAL"
                              : order.payment_status.toUpperCase()}
                          </span>
                          <div className="text-[10px] font-medium text-[#6B5E51] flex items-center gap-1">
                            {isCOD && <Banknote size={12} className="text-amber-700" />}
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
                            className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:ring-1 focus:ring-[#D4AF37] focus:outline-none cursor-pointer ${color.bg} ${color.text} ${color.border}`}
                          >
                            {allStatuses.map((st) => (
                              <option key={st} value={st}>
                                {st.replace(/_/g, " ").toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>

                        {order.notes && (
                          <div
                            className="text-[10px] text-[#8C8074] italic mt-1 max-w-[180px] truncate"
                            title={order.notes}
                          >
                            Note: {order.notes}
                          </div>
                        )}
                      </td>

                      {/* Action: View Modal */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#651F35] bg-[#FAF7F2] border border-[#E8DCC8] hover:bg-[#651F35] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#E8DCC8] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DCC8]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-[#25201D]">
                    {selectedOrder.order_number}
                  </h3>
                  {selectedOrder.payment_method === "Cash on Delivery" && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      Cash on Delivery
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8C8074] mt-0.5">
                  Booked on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-[#FAF7F2] text-[#8C8074] hover:text-charcoal transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-5 space-y-6">
              {/* Customer Contact & Delivery Address Card */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DCC8] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88A3B] block">
                  Delivery Destination & Customer Info
                </span>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#8C8074] block">Customer Name:</span>
                    <strong className="text-sm text-[#25201D]">
                      {selectedOrder.customer_name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#8C8074] block">Contact Phone:</span>
                    <a
                      href={`tel:${selectedOrder.customer_phone}`}
                      className="font-semibold text-[#651F35] hover:underline"
                    >
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8DCC8]/60 text-xs text-[#6B5E51]">
                  <span className="text-[#8C8074] block">Full Shipping Address:</span>
                  <div className="font-medium text-[#25201D] mt-0.5">
                    {selectedOrder.address.house_flat}, {selectedOrder.address.street}
                  </div>
                  <div>
                    {selectedOrder.address.city}, {selectedOrder.address.state} -{" "}
                    <span className="font-bold">{selectedOrder.address.pincode}</span>
                  </div>
                </div>
              </div>

              {/* Items Booked */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88A3B] block mb-2">
                  Saree Items Booked ({selectedOrder.order_items.length})
                </span>
                <div className="space-y-2.5">
                  {selectedOrder.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#E8DCC8] bg-white gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt=""
                            className="w-10 h-14 object-cover rounded-lg border border-[#E8DCC8] shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#25201D] truncate">
                            {item.product_name}
                          </p>
                          <p className="text-[11px] text-[#8C8074]">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-[#25201D] shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials & Payment Status */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DCC8] space-y-2 text-xs">
                <div className="flex justify-between text-[#8C8074]">
                  <span>Subtotal:</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8C8074]">
                  <span>Shipping:</span>
                  <span>
                    {selectedOrder.shipping === 0
                      ? "FREE"
                      : formatPrice(selectedOrder.shipping)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E8DCC8] font-bold text-sm text-[#651F35]">
                  <span>Grand Total Payable:</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8DCC8] mt-2">
                  <span className="text-[#8C8074]">Payment Status:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedOrder.payment_status === "paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {selectedOrder.payment_status}
                    </span>
                    {selectedOrder.payment_status !== "paid" && (
                      <button
                        type="button"
                        onClick={() => {
                          updateOrderStatus(
                            selectedOrder.id,
                            selectedOrder.status,
                            "paid"
                          )
                          setSelectedOrder({
                            ...selectedOrder,
                            payment_status: "paid",
                          })
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Mark Paid (Cash Collected)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88A3B] block mb-2">
                  Update Fulfillment Stage
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["pending", "confirmed", "shipped", "delivered"] as OrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, st)
                          setSelectedOrder({ ...selectedOrder, status: st })
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedOrder.status === st
                            ? "bg-[#651F35] text-white shadow-xs"
                            : "bg-[#FAF7F2] text-[#6B5E51] border border-[#E8DCC8] hover:bg-[#F5EDD9]"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#E8DCC8] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-primary py-2.5 px-6 text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
