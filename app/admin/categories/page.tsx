"use client"

import React, { useState } from "react"
import { useAdmin } from "@/contexts/AdminContext"
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  X,
  CheckCircle2,
} from "lucide-react"
import { AdminImageUpload } from "@/components/admin/AdminImageUpload"
import { Category, Collection } from "@/types/database"

export default function AdminCategoriesPage() {
  const {
    categories,
    collections,
    updateCategory,
    createCategory,
    deleteCategory,
    updateCollection,
    createCollection,
    deleteCollection,
  } = useAdmin()

  const [activeTab, setActiveTab] = useState<"categories" | "collections">("categories")
  const [isAddCatOpen, setIsAddCatOpen] = useState(false)
  const [isAddColOpen, setIsAddColOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)

  // Form states
  const [catForm, setCatForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_active: true,
  })

  const [colForm, setColForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_active: true,
  })

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!catForm.name.trim()) return
    createCategory(catForm)
    setCatForm({ name: "", slug: "", description: "", image_url: "", is_active: true })
    setIsAddCatOpen(false)
  }

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!colForm.name.trim()) return
    createCollection(colForm)
    setColForm({ name: "", slug: "", description: "", image_url: "", is_active: true })
    setIsAddColOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#25201D]">
            Categories & Curated Showcases
          </h2>
          <p className="text-xs text-[#6B5E51] mt-1">
            Organize saree taxonomy, silk weaves, festive edits, and promotional landing pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "categories" ? (
            <button
              onClick={() => setIsAddCatOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Saree Category</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddColOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B88A3B] text-[#181214] text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Curated Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8DCC8] pb-1">
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "categories"
              ? "border-[#651F35] text-[#651F35]"
              : "border-transparent text-[#6B5E51] hover:text-[#25201D]"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Saree Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("collections")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "collections"
              ? "border-[#D4AF37] text-[#8B6E32]"
              : "border-transparent text-[#6B5E51] hover:text-[#25201D]"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Curated Collections & Edits ({collections.length})</span>
        </button>
      </div>

      {/* Tab Content 1: Categories */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-[#E8DCC8] shadow-xs overflow-hidden flex flex-col hover:border-[#D4AF37] transition-all group"
            >
              <div className="aspect-[16/9] bg-[#FAF7F2] overflow-hidden relative border-b border-[#E8DCC8]">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8C8074]">
                    <FolderTree className="w-8 h-8 opacity-40" />
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/90 text-[#25201D] shadow-xs">
                  Order: {cat.display_order ?? 0}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#25201D] group-hover:text-[#651F35] transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] font-mono text-[#8C8074] mt-0.5">
                    /category/{cat.slug}
                  </p>
                  {cat.description && (
                    <p className="text-xs text-[#6B5E51] mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F0E6D8]">
                  <button
                    onClick={() =>
                      updateCategory(cat.id, { is_active: !cat.is_active })
                    }
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      cat.is_active
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {cat.is_active ? "Active in Store" : "Hidden"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(cat)}
                      className="p-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`/category/${cat.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-lg text-[#651F35] hover:bg-[#651F35]/10"
                      title="View category page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 2: Collections */}
      {activeTab === "collections" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-white rounded-2xl border border-[#E8DCC8] shadow-xs overflow-hidden flex flex-col hover:border-[#D4AF37] transition-all group"
            >
              <div className="aspect-[16/9] bg-[#FAF7F2] overflow-hidden relative border-b border-[#E8DCC8]">
                {col.image_url ? (
                  <img
                    src={col.image_url}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8C8074]">
                    <Sparkles className="w-8 h-8 opacity-40 text-[#D4AF37]" />
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#181214]/80 text-[#D4AF37] shadow-xs">
                  Order: {col.display_order ?? 0}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#25201D] group-hover:text-[#651F35] transition-colors">
                    {col.name}
                  </h4>
                  <p className="text-[11px] font-mono text-[#8C8074] mt-0.5">
                    /collections/{col.slug}
                  </p>
                  {col.description && (
                    <p className="text-xs text-[#6B5E51] mt-1.5 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F0E6D8]">
                  <button
                    onClick={() =>
                      updateCollection(col.id, { is_active: !col.is_active })
                    }
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      col.is_active
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {col.is_active ? "Active in Store" : "Hidden"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingCollection(col)}
                      className="p-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer transition-colors"
                      title="Edit Collection"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`/collections/${col.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-lg text-[#651F35] hover:bg-[#651F35]/10"
                      title="View collection page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => deleteCollection(col.id)}
                      className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCatOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E8DCC8] shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#181214] text-white flex items-center justify-between border-b border-[#302127]">
              <h3 className="font-serif text-base font-bold">Add Saree Category</h3>
              <button
                onClick={() => setIsAddCatOpen(false)}
                className="text-[#D8CFBC] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banarasi Silk Sarees"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Slug</label>
                <input
                  type="text"
                  placeholder="e.g. banarasi-silk-sarees"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <AdminImageUpload
                  value={catForm.image_url}
                  onChange={(url) => setCatForm({ ...catForm, image_url: url })}
                  bucket="category-images"
                  label="Category Cover Photo (Upload File)"
                  aspectRatio="16/9"
                  prefix="cat"
                  placeholderText="Drop category cover photo here, or browse files"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Description</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCatOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#6B5E51] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#651F35] text-white font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={async (updates) => {
            await updateCategory(editingCategory.id, updates)
            setEditingCategory(null)
          }}
        />
      )}

      {/* Add Collection Modal */}
      {isAddColOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E8DCC8] shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#181214] text-white flex items-center justify-between border-b border-[#302127]">
              <h3 className="font-serif text-base font-bold">Add Curated Edit</h3>
              <button
                onClick={() => setIsAddColOpen(false)}
                className="text-[#D8CFBC] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCollection} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Collection Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Bridal Showcase"
                  value={colForm.name}
                  onChange={(e) => setColForm({ ...colForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Slug</label>
                <input
                  type="text"
                  placeholder="e.g. royal-bridal-showcase"
                  value={colForm.slug}
                  onChange={(e) => setColForm({ ...colForm, slug: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <AdminImageUpload
                  value={colForm.image_url}
                  onChange={(url) => setColForm({ ...colForm, image_url: url })}
                  bucket="category-images"
                  label="Collection Showcase Photo (Upload File)"
                  aspectRatio="16/9"
                  prefix="col"
                  placeholderText="Drop curated collection cover photo here, or browse files"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#25201D] uppercase">Description</label>
                <textarea
                  rows={2}
                  value={colForm.description}
                  onChange={(e) => setColForm({ ...colForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddColOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#6B5E51] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-[#181214] font-bold"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {editingCollection && (
        <EditCollectionModal
          collection={editingCollection}
          onClose={() => setEditingCollection(null)}
          onSave={async (updates) => {
            await updateCollection(editingCollection.id, updates)
            setEditingCollection(null)
          }}
        />
      )}
    </div>
  )
}

function EditCategoryModal({
  category,
  onClose,
  onSave,
}: {
  category: Category
  onClose: () => void
  onSave: (updates: Partial<Category>) => Promise<void>
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: category.name || "",
    slug: category.slug || "",
    description: category.description || "",
    image_url: category.image_url || "",
    display_order: category.display_order ?? 0,
    is_active: category.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setIsSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
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
              <h3 className="font-serif text-base font-bold text-[#FFF9EF]">
                Edit Saree Category
              </h3>
              <p className="text-[11px] text-[#D8CFBC]">
                Update category title, slug, description, and cover image
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

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                URL Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
                onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <AdminImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              bucket="category-images"
              label="Category Cover Photo (Upload or Replace)"
              aspectRatio="16/9"
              prefix="cat"
              placeholderText="Drop category cover photo here, or browse files"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
              Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9]">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-[#651F35] focus:ring-[#D4AF37]"
            />
            <span className="font-bold text-[#25201D]">Active in Customer Storefront</span>
          </label>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#E8DCC8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#6B5E51] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] text-white font-bold disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditCollectionModal({
  collection,
  onClose,
  onSave,
}: {
  collection: Collection
  onClose: () => void
  onSave: (updates: Partial<Collection>) => Promise<void>
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: collection.name || "",
    slug: collection.slug || "",
    description: collection.description || "",
    image_url: collection.image_url || "",
    display_order: collection.display_order ?? 0,
    is_active: collection.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setIsSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
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
              <h3 className="font-serif text-base font-bold text-[#FFF9EF]">
                Edit Curated Edit / Collection
              </h3>
              <p className="text-[11px] text-[#D8CFBC]">
                Update collection title, slug, and showcase photo
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

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
              Collection Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
                URL Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
                onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <AdminImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              bucket="category-images"
              label="Collection Showcase Photo (Upload or Replace)"
              aspectRatio="16/9"
              prefix="col"
              placeholderText="Drop curated collection cover photo here, or browse files"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#25201D] uppercase tracking-wider text-[11px]">
              Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E8DCC8] bg-[#FAF7F2] cursor-pointer hover:bg-[#F5EDD9]">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-[#651F35] focus:ring-[#D4AF37]"
            />
            <span className="font-bold text-[#25201D]">Active in Customer Storefront</span>
          </label>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#E8DCC8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#6B5E51] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#D4AF37] text-[#181214] font-bold disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
