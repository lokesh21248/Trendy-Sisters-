"use client"

import React, { useState } from "react"
import { useAdmin } from "@/contexts/AdminContext"
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  MoveUp,
  MoveDown,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react"
import { AdminImageUpload } from "@/components/admin/AdminImageUpload"
import { Banner } from "@/types/database"

export default function AdminBannersPage() {
  const { banners, updateBanner, createBanner, deleteBanner } = useAdmin()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "/shop",
    is_active: true,
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.image_url.trim()) return
    createBanner(form)
    setForm({
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "/shop",
      is_active: true,
    })
    setIsAddOpen(false)
  }

  const handleReorder = (bannerId: string, currentOrder: number, delta: number) => {
    const targetOrder = Math.max(0, currentOrder + delta)
    updateBanner(bannerId, { display_order: targetOrder })
  }

  return (
    <div className="space-y-6">
      {/* Title & Add Banner CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#25201D]">
            Hero Banners & Seasonal Campaigns
          </h2>
          <p className="text-xs text-[#6B5E51] mt-1">
            Manage high-impact homepage carousel sliders, seasonal saree edits, and promotional CTA links.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className="bg-white rounded-3xl border border-[#E8DCC8] shadow-xs overflow-hidden flex flex-col hover:border-[#D4AF37] transition-all group"
          >
            {/* Visual Banner Preview */}
            <div className="aspect-[16/9] bg-[#FAF7F2] relative overflow-hidden">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                  Slide #{idx + 1} · Order: {banner.display_order}
                </span>
                <h4 className="font-serif font-bold text-base leading-tight mt-1 text-[#FFF9EF]">
                  {banner.title}
                </h4>
                {banner.subtitle && (
                  <p className="text-xs text-[#D8CFBC] line-clamp-1 mt-0.5">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Banner Metadata & Actions */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#8B6E32] uppercase text-[10px]">
                    CTA Link Destination:
                  </span>
                  <a
                    href={banner.link_url || "/shop"}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[#651F35] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>{banner.link_url || "/shop"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F0E6D8]">
                {/* Active switch */}
                <button
                  type="button"
                  onClick={() =>
                    updateBanner(banner.id, { is_active: !banner.is_active })
                  }
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                    banner.is_active
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                  }`}
                >
                  {banner.is_active ? "Active in Slider" : "Disabled"}
                </button>

                {/* Edit, Reorder and Delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingBanner(banner)}
                    className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer transition-colors"
                    title="Edit Banner Details & Photo"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleReorder(banner.id, banner.display_order, -1)
                    }
                    className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#25201D] hover:bg-[#F5EDD9] cursor-pointer"
                    title="Move slide up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleReorder(banner.id, banner.display_order, 1)
                    }
                    className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#25201D] hover:bg-[#F5EDD9] cursor-pointer"
                    title="Move slide down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteBanner(banner.id)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer ml-1"
                    title="Delete slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Banner Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#D4AF37]/30 shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#181214] text-white flex items-center justify-between border-b border-[#302127]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-serif text-base font-bold">
                  Add Homepage Hero Banner
                </h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-[#D8CFBC] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Wedding Kanjivaram Edit"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">
                  Subtitle / Promo Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handwoven Pure Zari Elegance · Up to 40% Off"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm({ ...form, subtitle: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">
                  Click Destination (URL Link)
                </label>
                <input
                  type="text"
                  placeholder="/shop or /category/kanjivaram-silk"
                  value={form.link_url}
                  onChange={(e) =>
                    setForm({ ...form, link_url: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] font-mono"
                />
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-1">
                <AdminImageUpload
                  value={form.image_url}
                  onChange={(url) => setForm({ ...form, image_url: url })}
                  bucket="banner-images"
                  label="Hero Banner Image (Upload File)"
                  aspectRatio="16/9"
                  prefix="banner"
                  placeholderText="Drop wide hero banner image (1920x800 recommended)"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DCC8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#6B5E51] font-semibold hover:bg-[#F5EDD9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white font-bold cursor-pointer shadow-md"
                >
                  Publish Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {editingBanner && (
        <EditBannerModal
          banner={editingBanner}
          onClose={() => setEditingBanner(null)}
          onSave={async (updates) => {
            await updateBanner(editingBanner.id, updates)
            setEditingBanner(null)
          }}
        />
      )}
    </div>
  )
}

function EditBannerModal({
  banner,
  onClose,
  onSave,
}: {
  banner: Banner
  onClose: () => void
  onSave: (updates: Partial<Banner>) => Promise<void>
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: banner.title || "",
    subtitle: banner.subtitle || "",
    image_url: banner.image_url || "",
    link_url: banner.link_url || "/shop",
    display_order: banner.display_order ?? 0,
    is_active: banner.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.image_url.trim()) return
    setIsSaving(true)
    try {
      await onSave({
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        image_url: form.image_url.trim(),
        link_url: form.link_url.trim() || "/shop",
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#D4AF37]/30 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#181214] via-[#2A151E] to-[#651F35] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D4AF37] text-[#181214]">
              <Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#FFF9EF]">
                Edit Hero Banner
              </h3>
              <p className="text-[11px] text-[#D8CFBC]">
                Update slider headline, image banner, destination link, and order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#D8CFBC] hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
              Headline Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
              Subtitle / Promo Tagline
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Click Destination URL
              </label>
              <input
                type="text"
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                Display Order
              </label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) =>
                  setForm({ ...form, display_order: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold"
              />
            </div>
          </div>

          {/* Active switch */}
          <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9] transition-colors">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-[#651F35] focus:ring-[#D4AF37]"
            />
            <span className="font-bold text-[#25201D]">Active in Hero Slider Carousel</span>
          </label>

          {/* Banner Image Upload */}
          <div className="space-y-1">
            <AdminImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              bucket="banner-images"
              label="Banner Image (Upload or Replace)"
              aspectRatio="16/9"
              prefix="banner"
              placeholderText="Drop wide hero banner image (1920x800 recommended)"
            />
          </div>

          <div className="pt-3 border-t border-[#E8DCC8] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#6B5E51] font-semibold hover:bg-[#F5EDD9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white font-bold cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Save Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
