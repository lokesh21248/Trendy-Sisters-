"use client"

import React, { useState } from "react"
import { useAdmin } from "@/contexts/AdminContext"
import { CalendarHeart, Plus, Edit, Trash2, X } from "lucide-react"
import { Occasion } from "@/types/database"

export default function AdminOccasionsPage() {
  const { occasions, products, createOccasion, updateOccasion, deleteOccasion, showToast } = useAdmin()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null)

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
    sort_order: occasions.length + 1,
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    createOccasion({
      name: form.name.trim(),
      description: form.description.trim() || null,
      is_active: form.is_active,
      sort_order: Number(form.sort_order),
    })
    setForm({ name: "", description: "", is_active: true, sort_order: occasions.length + 2 })
    setIsAddOpen(false)
  }

  const handleDelete = (id: string) => {
    const isUsed = products.some((p) => p.occasion_id === id)
    if (isUsed) {
      const count = products.filter((p) => p.occasion_id === id).length
      showToast(
        "Cannot Delete",
        `This occasion is currently used by ${count} products. Deactivate it instead.`,
        "error"
      )
      return
    }
    if (confirm("Are you sure you want to delete this occasion?")) {
      deleteOccasion(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#25201D]">Occasions</h2>
          <p className="text-xs text-[#6B5E51] mt-1">
            Manage the occasions available for saree catalog classification.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B88A3B] text-[#181214] text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Occasion</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#25201D]">
            <thead className="bg-[#FAF7F2] border-b border-[#E8DCC8] text-xs uppercase font-bold tracking-wider text-[#8C8074]">
              <tr>
                <th className="px-6 py-4">Occasion</th>
                <th className="px-6 py-4 text-center">Products</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8]">
              {occasions.map((occ) => {
                const count = products.filter((p) => p.occasion_id === occ.id).length
                return (
                  <tr key={occ.id} className="hover:bg-[#FCFBF8] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#25201D]">{occ.name}</div>
                      {occ.description && (
                        <div className="text-[11px] text-[#6B5E51] mt-0.5">{occ.description}</div>
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
                          occ.is_active
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                            : "bg-gray-100 text-gray-600 border border-gray-300"
                        }`}
                      >
                        {occ.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateOccasion(occ.id, { is_active: !occ.is_active })}
                          className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          {occ.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => setEditingOccasion(occ)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(occ.id)}
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
              {occasions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#8C8074]">
                    <CalendarHeart className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>No occasions found. Add your first occasion.</p>
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
              <h3 className="font-serif text-base font-bold">Add Occasion</h3>
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
                  placeholder="e.g. Wedding"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
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
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#D4AF37] text-[#181214] font-bold">
                  Save Occasion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingOccasion && (
        <EditOccasionModal
          occasion={editingOccasion}
          onClose={() => setEditingOccasion(null)}
          onSave={async (updates) => {
            await updateOccasion(editingOccasion.id, updates)
            setEditingOccasion(null)
          }}
        />
      )}
    </div>
  )
}

function EditOccasionModal({
  occasion,
  onClose,
  onSave,
}: {
  occasion: Occasion
  onClose: () => void
  onSave: (updates: Partial<Occasion>) => Promise<void>
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: occasion.name,
    description: occasion.description || "",
    is_active: occasion.is_active,
    sort_order: occasion.sort_order,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setIsSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
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
              <h3 className="font-serif text-base font-bold text-[#FFF9EF]">Edit Occasion</h3>
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
              className="px-5 py-2 rounded-xl bg-[#D4AF37] text-[#181214] font-bold disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
