"use client"

import React, { useState } from "react"
import { useAdmin } from "@/contexts/AdminContext"
import { Palette, Plus, Edit, Trash2, X } from "lucide-react"
import { ColorShade } from "@/types/database"

export default function AdminColorShadesPage() {
  const { colorShades, products, createColorShade, updateColorShade, deleteColorShade, showToast } = useAdmin()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingShade, setEditingShade] = useState<ColorShade | null>(null)

  const [form, setForm] = useState({
    name: "",
    hex_code: "",
    description: "",
    is_active: true,
    sort_order: colorShades.length + 1,
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    createColorShade({
      name: form.name.trim(),
      hex_code: form.hex_code.trim() || null,
      description: form.description.trim() || null,
      is_active: form.is_active,
      sort_order: Number(form.sort_order),
    })
    setForm({ name: "", hex_code: "", description: "", is_active: true, sort_order: colorShades.length + 2 })
    setIsAddOpen(false)
  }

  const handleDelete = (id: string) => {
    const isUsed = products.some((p) => p.color_shade_id === id)
    if (isUsed) {
      const count = products.filter((p) => p.color_shade_id === id).length
      showToast(
        "Cannot Delete",
        `This color shade is currently used by ${count} products. Deactivate it instead.`,
        "error"
      )
      return
    }
    if (confirm("Are you sure you want to delete this color shade?")) {
      deleteColorShade(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#25201D]">Color Shades</h2>
          <p className="text-xs text-[#6B5E51] mt-1">
            Manage saree color shades available across the catalog.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Color Shade</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#25201D]">
            <thead className="bg-[#FAF7F2] border-b border-[#E8DCC8] text-xs uppercase font-bold tracking-wider text-[#8C8074]">
              <tr>
                <th className="px-6 py-4">Color Shade</th>
                <th className="px-6 py-4">Visual</th>
                <th className="px-6 py-4 text-center">Products</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8]">
              {colorShades.map((shade) => {
                const count = products.filter((p) => p.color_shade_id === shade.id).length
                return (
                  <tr key={shade.id} className="hover:bg-[#FCFBF8] transition-colors group">
                    <td className="px-6 py-4 font-semibold text-[#25201D]">{shade.name}</td>
                    <td className="px-6 py-4">
                      {shade.hex_code ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                            style={{ backgroundColor: shade.hex_code }}
                          />
                          <span className="font-mono text-xs text-[#8C8074]">{shade.hex_code}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No hex code</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                        {count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          shade.is_active
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                            : "bg-gray-100 text-gray-600 border border-gray-300"
                        }`}
                      >
                        {shade.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateColorShade(shade.id, { is_active: !shade.is_active })}
                          className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          {shade.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => setEditingShade(shade)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(shade.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {colorShades.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#8C8074]">
                    <Palette className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>No color shades found. Add your first color shade.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E8DCC8] shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#181214] text-white flex items-center justify-between border-b border-[#302127]">
              <h3 className="font-serif text-base font-bold">Add Color Shade</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#D8CFBC] hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Maroon"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Color Hex Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.hex_code || "#000000"}
                    onChange={(e) => setForm({ ...form, hex_code: e.target.value })}
                    className="w-10 h-10 p-1 rounded cursor-pointer border border-[#E8DCC8]"
                  />
                  <input
                    type="text"
                    placeholder="#6B1026"
                    value={form.hex_code}
                    onChange={(e) => setForm({ ...form, hex_code: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] font-mono focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9]">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-[#651F35] focus:ring-[#D4AF37]"
                  />
                  <span className="font-bold text-[#25201D]">Active</span>
                </label>
                <div className="space-y-1">
                  <input
                    type="number"
                    placeholder="Sort Order"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#6B5E51] font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#651F35] text-white font-bold">
                  Save Color Shade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingShade && (
        <EditColorShadeModal
          shade={editingShade}
          onClose={() => setEditingShade(null)}
          onSave={async (updates) => {
            await updateColorShade(editingShade.id, updates)
            setEditingShade(null)
          }}
        />
      )}
    </div>
  )
}

function EditColorShadeModal({
  shade,
  onClose,
  onSave,
}: {
  shade: ColorShade
  onClose: () => void
  onSave: (updates: Partial<ColorShade>) => Promise<void>
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: shade.name,
    hex_code: shade.hex_code || "",
    description: shade.description || "",
    is_active: shade.is_active,
    sort_order: shade.sort_order,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setIsSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        hex_code: form.hex_code.trim() || null,
        description: form.description.trim() || null,
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#D4AF37]/40 shadow-2xl overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-[#181214] via-[#2A151E] to-[#651F35] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D4AF37] text-[#181214]">
              <Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#FFF9EF]">Edit Color Shade</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-[#D8CFBC] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] font-medium focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase">Color Hex Code</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.hex_code || "#000000"}
                onChange={(e) => setForm({ ...form, hex_code: e.target.value })}
                className="w-10 h-10 p-1 rounded cursor-pointer border border-[#E8DCC8]"
              />
              <input
                type="text"
                placeholder="#6B1026"
                value={form.hex_code}
                onChange={(e) => setForm({ ...form, hex_code: e.target.value })}
                className="flex-1 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] font-mono focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9]">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-[#651F35] focus:ring-[#D4AF37]"
              />
              <span className="font-bold text-[#25201D]">Active</span>
            </label>
            <div className="space-y-1">
              <input
                type="number"
                placeholder="Sort Order"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2 border-t border-[#E8DCC8]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#FAF7F2] font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#651F35] text-white font-bold disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
