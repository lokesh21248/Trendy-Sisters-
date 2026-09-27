"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Bell,
  Package,
  Sparkles,
  Tag,
  CheckCircle,
  Clock,
  Trash2,
  CheckCheck,
  ChevronRight,
} from "lucide-react"

interface NotificationItem {
  id: string
  type: "order" | "offer" | "system"
  title: string
  message: string
  timestamp: string
  isRead: boolean
  link?: string
  linkText?: string
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    type: "order",
    title: "Order Placed Successfully",
    message: "Thank you for your purchase! We are carefully preparing your saree for dispatch.",
    timestamp: "2 hours ago",
    isRead: false,
    link: "/account/orders",
    linkText: "View Orders",
  },
  {
    id: "notif_2",
    type: "offer",
    title: "Festive Grandeur: 25% OFF",
    message: "Use voucher code FESTIVE25 to get instant 25% discount on all Pure Silk & Kanjivaram Sarees.",
    timestamp: "1 day ago",
    isRead: false,
    link: "/account/coupons",
    linkText: "View Coupon",
  },
  {
    id: "notif_3",
    type: "system",
    title: "Welcome to Trendy Sisters",
    message: "Welcome to India's premier online saree boutique. Explore handcrafted weaves straight from master artisans.",
    timestamp: "3 days ago",
    isRead: true,
    link: "/shop",
    linkText: "Explore Collection",
  },
  {
    id: "notif_4",
    type: "offer",
    title: "Free Express Shipping Live",
    message: "Enjoy zero shipping charges on all orders above ₹799 across India for a limited time.",
    timestamp: "5 days ago",
    isRead: true,
    link: "/shop",
    linkText: "Shop Now",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [filter, setFilter] = useState<"all" | "order" | "offer">("all")

  const unreadCount = notifications.filter((n) => !n.isRead).length

  function markAllRead() {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  function clearAll() {
    if (confirm("Clear all notifications?")) {
      setNotifications([])
    }
  }

  function toggleRead(id: string) {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true
    return n.type === filter
  })

  function getIcon(type: NotificationItem["type"]) {
    switch (type) {
      case "order":
        return <Package size={18} className="text-blue-600" />
      case "offer":
        return <Tag size={18} className="text-burgundy" />
      case "system":
        return <Sparkles size={18} className="text-amber-600" />
    }
  }

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen pb-20 lg:pb-12">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="p-2 -ml-2 rounded-full hover:bg-ivory-dark transition-colors"
              aria-label="Back to account"
            >
              <ArrowLeft size={20} className="text-charcoal" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-2xl lg:text-3xl font-bold text-charcoal">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-burgundy text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9B8A7A]">Order milestones, promotional vouchers, and customer alerts</p>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-charcoal hover:bg-ivory-dark transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={15} />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={clearAll}
                className="p-2 rounded-xl text-xs text-[#9B8A7A] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Clear all"
                aria-label="Clear all notifications"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-burgundy text-white shadow-sm"
                : "bg-white text-charcoal border border-[var(--border)] hover:bg-ivory"
            }`}
          >
            All Updates ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("order")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === "order"
                ? "bg-burgundy text-white shadow-sm"
                : "bg-white text-charcoal border border-[var(--border)] hover:bg-ivory"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setFilter("offer")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === "offer"
                ? "bg-burgundy text-white shadow-sm"
                : "bg-white text-charcoal border border-[var(--border)] hover:bg-ivory"
            }`}
          >
            Offers & Deals
          </button>
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[var(--border)] shadow-sm">
            <div className="w-20 h-20 bg-ivory-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-burgundy opacity-40" />
            </div>
            <h2 className="font-serif text-xl font-bold text-charcoal mb-1">No notifications here</h2>
            <p className="text-sm text-[#9B8A7A] max-w-sm mx-auto mb-6">
              You are all caught up! You will be notified here whenever your order moves or a new offer drops.
            </p>
            <Link href="/shop" className="btn-primary inline-flex">
              Explore Sarees
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRead(item.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  item.isRead
                    ? "bg-white border-[var(--border)] opacity-90 hover:opacity-100"
                    : "bg-white border-burgundy/40 shadow-sm ring-1 ring-burgundy/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(101,31,53,0.06)" }}
                  >
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3
                        className={`text-sm font-semibold truncate ${
                          item.isRead ? "text-charcoal" : "text-charcoal font-bold"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span className="text-[11px] text-[#9B8A7A] flex items-center gap-1 flex-shrink-0">
                        <Clock size={11} /> {item.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#9B8A7A] leading-relaxed mb-3">{item.message}</p>

                    {item.link && (
                      <Link
                        href={item.link}
                        className="inline-flex items-center gap-1 text-xs font-bold text-burgundy hover:underline"
                      >
                        {item.linkText || "View Details"}
                        <ChevronRight size={13} />
                      </Link>
                    )}
                  </div>

                  {!item.isRead && (
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-burgundy flex-shrink-0 mt-1.5"
                      title="Unread"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
