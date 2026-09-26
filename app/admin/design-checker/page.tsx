"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useAdmin } from "@/contexts/AdminContext"
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Shirt,
  Palette,
  Tag,
  Camera,
  IndianRupee,
  Package,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Star,
  Eye,
  RefreshCw,
  Search,
  ArrowUpDown,
  ShoppingBag,
  Heart,
  ChevronRight,
  MoveLeft,
  MoveRight,
} from "lucide-react"
import {
  FilterPill,
  SAREE_COLOR_PALETTES,
  SAREE_FABRICS,
  SAREE_OCCASIONS,
  IMAGE_ANGLE_LABELS,
  ProductWithDetails,
} from "@/types/admin"
import { AdminImageUpload } from "@/components/admin/AdminImageUpload"
import { uploadImageToStorage } from "@/lib/admin/storage"

export default function DesignCheckerPage() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get("id")
  const initialFilter = searchParams.get("filter") as FilterPill | null

  const {
    products,
    categories,
    collections,
    selectedAuditProductId,
    setSelectedAuditProductId,
    auditFilter,
    setAuditFilter,
    updateProduct,
    addProductImage,
    removeProductImage,
    setProductPrimaryImage,
    reorderProductImages,
    showToast,
  } = useAdmin()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"attributes" | "pricing" | "gallery">("attributes")
  const [activeAngleIndex, setActiveAngleIndex] = useState(0)
  const [newImageUrl, setNewImageUrl] = useState("")

  // Form state for selected saree
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    fabric: "",
    color: "",
    occasion: "",
    price: 0,
    mrp: 0,
    stock: 0,
    category_id: "",
    collection_id: "",
    is_new: false,
    is_bestseller: false,
    is_featured: false,
    is_active: true,
    description: "",
  })

  // Set filter from URL param if present
  useEffect(() => {
    if (initialFilter) {
      setAuditFilter(initialFilter)
    }
  }, [initialFilter, setAuditFilter])

  // Select saree from URL if provided
  useEffect(() => {
    if (initialId && products.some((p) => p.id === initialId)) {
      setSelectedAuditProductId(initialId)
    } else if (!selectedAuditProductId && products.length > 0) {
      setSelectedAuditProductId(products[0].id)
    }
  }, [initialId, products, selectedAuditProductId, setSelectedAuditProductId])

  // Filter products based on selected audit filter pill & search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = p.name?.toLowerCase().includes(q)
        const matchesSku = p.sku?.toLowerCase().includes(q)
        const matchesFabric = p.fabric?.toLowerCase().includes(q)
        if (!matchesName && !matchesSku && !matchesFabric) return false
      }

      // Audit Filter Pill
      const c = p.completeness
      if (auditFilter === "complete") return c.score === 100
      if (auditFilter === "review") return c.score < 100
      if (auditFilter === "missing-fabric") return !c.criteria.fabric.passed
      if (auditFilter === "missing-color") return !c.criteria.color.passed
      if (auditFilter === "missing-occasion") return !c.criteria.occasion.passed
      if (auditFilter === "missing-images") return !c.criteria.images.passed
      if (auditFilter === "low-stock")
        return !c.criteria.stockSku.passed || (p.stock !== null && p.stock < 10)

      return true
    })
  }, [products, auditFilter, searchQuery])

  // Get currently selected saree
  const currentSaree: ProductWithDetails | undefined = useMemo(() => {
    return (
      products.find((p) => p.id === selectedAuditProductId) ||
      filteredProducts[0] ||
      products[0]
    )
  }, [products, selectedAuditProductId, filteredProducts])

  // Sync form data whenever currentSaree changes
  useEffect(() => {
    if (currentSaree) {
      setFormData({
        name: currentSaree.name || "",
        sku: currentSaree.sku || "",
        fabric: currentSaree.fabric || "",
        color: currentSaree.color || "",
        occasion: currentSaree.occasion || "",
        price: Number(currentSaree.price) || 0,
        mrp: Number(currentSaree.mrp) || 0,
        stock: Number(currentSaree.stock) || 0,
        category_id: currentSaree.category_id || "",
        collection_id: currentSaree.collection_id || "",
        is_new: currentSaree.is_new ?? false,
        is_bestseller: currentSaree.is_bestseller ?? false,
        is_featured: currentSaree.is_featured ?? false,
        is_active: currentSaree.is_active ?? true,
        description: currentSaree.description || "",
      })
      setActiveAngleIndex(0)
    }
  }, [currentSaree])

  // Auto calculate discount percentage
  const calculatedDiscount = useMemo(() => {
    if (formData.mrp > 0 && formData.price > 0 && formData.price <= formData.mrp) {
      return Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)
    }
    return 0
  }, [formData.price, formData.mrp])

  // Handle saving form changes
  const handleSaveAttributes = async () => {
    if (!currentSaree) return
    await updateProduct(currentSaree.id, {
      ...formData,
      discount: calculatedDiscount,
    })
  }

  // Handle adding an image
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSaree || !newImageUrl.trim()) return
    addProductImage(currentSaree.id, newImageUrl.trim())
    setNewImageUrl("")
  }

  // Handle reordering images left/right
  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    if (!currentSaree) return
    const imgs = [...currentSaree.product_images]
    if (toIdx < 0 || toIdx >= imgs.length) return
    const temp = imgs[fromIdx]
    imgs[fromIdx] = imgs[toIdx]
    imgs[toIdx] = temp
    reorderProductImages(currentSaree.id, imgs)
  }

  const completeness = currentSaree?.completeness
  const score = completeness?.score || 0
  const is100 = score === 100

  // Filter Pill Definitions
  const filterPills: { id: FilterPill; label: string; count?: number }[] = [
    { id: "all", label: "All Sarees" },
    { id: "complete", label: "100% Complete" },
    { id: "review", label: "Needs Review" },
    { id: "missing-fabric", label: "Missing Fabric" },
    { id: "missing-color", label: "Missing Color" },
    { id: "missing-occasion", label: "Missing Occasion" },
    { id: "missing-images", label: "Missing Images" },
    { id: "low-stock", label: "Low Stock" },
  ]

  // Image list for simulator
  const galleryImages = currentSaree?.product_images || []
  const activeImage =
    galleryImages[activeAngleIndex]?.image_url ||
    galleryImages[0]?.image_url ||
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"

  // Selected color swatch hex
  const activeColorSwatch = SAREE_COLOR_PALETTES.find(
    (c) => c.name.toLowerCase() === formData.color?.toLowerCase()
  )

  return (
    <div className="space-y-6">
      {/* Page Title & Mission */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#651F35] to-[#D4AF37] text-white shadow-md">
              <ShieldCheck className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#25201D]">
              Design Field Checker & Quality Control
            </h2>
          </div>
          <p className="text-xs text-[#6B5E51] mt-1">
            Audit saree design attributes, high-resolution angle coverage, and live customer drape simulation.
          </p>
        </div>

        {/* Global Catalog Health Gauge */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#E8DCC8] shadow-xs">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B6E32]">
              Saree Design QC Status
            </span>
            <span className="text-xs font-bold text-[#25201D]">
              {products.filter((p) => p.completeness?.score === 100).length} of{" "}
              {products.length} ready for publish
            </span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] flex items-center justify-center font-serif text-xs font-bold text-[#651F35] bg-[#FAF7F2]">
            {score}%
          </div>
        </div>
      </div>

      {/* Filter Pills & Saree Quick Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DCC8] shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
            {filterPills.map((pill) => {
              const isSelected = auditFilter === pill.id
              return (
                <button
                  key={pill.id}
                  onClick={() => setAuditFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#651F35] text-white shadow-sm"
                      : "bg-[#FAF7F2] text-[#6B5E51] hover:text-[#25201D] hover:bg-[#F5EDD9] border border-[#E8DCC8]"
                  }`}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>

          {/* Saree Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#8C8074] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by saree name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] placeholder-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
        </div>

        {/* Saree Selector Thumbnails Strip */}
        <div className="pt-2 border-t border-[#F0E6D8]">
          <div className="text-[11px] font-semibold text-[#8B6E32] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Select Saree for Inspection ({filteredProducts.length} shown)</span>
            {auditFilter !== "all" && (
              <button
                onClick={() => setAuditFilter("all")}
                className="text-[#651F35] hover:underline normal-case text-xs"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {filteredProducts.map((p) => {
              const isSelected = p.id === currentSaree?.id
              const pScore = p.completeness?.score || 0
              const thumb =
                p.product_images?.[0]?.image_url ||
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80"

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedAuditProductId(p.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left shrink-0 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-md"
                      : "bg-[#FAF7F2] border-[#E8DCC8] hover:bg-white hover:border-[#B88A3B]"
                  }`}
                >
                  <div className="w-10 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-[#E8DCC8]">
                    <img
                      src={thumb}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="max-w-[130px]">
                    <div className="text-xs font-semibold text-[#25201D] truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-[#8C8074] truncate">
                      {p.sku || "No SKU"}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          pScore === 100
                            ? "bg-emerald-100 text-emerald-800"
                            : pScore >= 70
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {pScore}%
                      </span>
                      <span className="text-[10px] font-medium text-[#25201D]">
                        ₹{p.price?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {currentSaree ? (
        <div className="space-y-6">
          {/* Top Audit Banner for Selected Saree */}
          <div className="bg-white rounded-2xl p-5 border border-[#E8DCC8] shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#651F35]/10 text-[#651F35] border border-[#651F35]/20">
                    {formData.sku || "UNASSIGNED SKU"}
                  </span>
                  <span className="text-xs text-[#8C8074]">·</span>
                  <span className="text-xs font-medium text-[#6B5E51]">
                    {formData.fabric || "Weave Undefined"}
                  </span>
                  <span className="text-xs text-[#8C8074]">·</span>
                  <span className="text-xs font-medium text-[#6B5E51]">
                    {formData.occasion || "Occasion Undefined"}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#25201D]">
                  {formData.name}
                </h3>
              </div>

              {/* Completeness Score Gauge + Save CTA */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B6E32]">
                      Design Completeness
                    </span>
                    <div className="font-serif text-xl font-bold text-[#651F35]">
                      {score}%
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-xs font-bold ${
                      is100
                        ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                        : score >= 70
                        ? "border-amber-500 text-amber-700 bg-amber-50"
                        : "border-rose-500 text-rose-700 bg-rose-50"
                    }`}
                  >
                    {is100 ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      `${score}%`
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSaveAttributes}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#651F35] to-[#8B2D47] hover:from-[#501829] hover:to-[#722338] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Save Design Attributes
                </button>
              </div>
            </div>

            {/* 6 Criteria Status Checklist Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-[#F0E6D8]">
              {completeness && (
                <>
                  {/* Criterion 1: Fabric */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      completeness.criteria.fabric.passed
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                        : "bg-amber-50/80 border-amber-200 text-amber-900"
                    }`}
                  >
                    {completeness.criteria.fabric.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Fabric (+20%)
                      </div>
                      <div className="text-xs font-bold truncate">
                        {formData.fabric || "Missing"}
                      </div>
                    </div>
                  </div>

                  {/* Criterion 2: Color */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      completeness.criteria.color.passed
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                        : "bg-amber-50/80 border-amber-200 text-amber-900"
                    }`}
                  >
                    {completeness.criteria.color.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Color (+20%)
                      </div>
                      <div className="text-xs font-bold truncate">
                        {formData.color || "Missing"}
                      </div>
                    </div>
                  </div>

                  {/* Criterion 3: Occasion */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      completeness.criteria.occasion.passed
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                        : "bg-amber-50/80 border-amber-200 text-amber-900"
                    }`}
                  >
                    {completeness.criteria.occasion.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Occasion (+20%)
                      </div>
                      <div className="text-xs font-bold truncate">
                        {formData.occasion || "Missing"}
                      </div>
                    </div>
                  </div>

                  {/* Criterion 4: Gallery */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      completeness.criteria.images.passed
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                        : "bg-rose-50/80 border-rose-200 text-rose-900"
                    }`}
                  >
                    {completeness.criteria.images.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Gallery (+20%)
                      </div>
                      <div className="text-xs font-bold truncate">
                        {galleryImages.length} {galleryImages.length === 1 ? "angle" : "angles"} (min 2)
                      </div>
                    </div>
                  </div>

                  {/* Criterion 5: Pricing */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      completeness.criteria.pricing.passed
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                        : "bg-amber-50/80 border-amber-200 text-amber-900"
                    }`}
                  >
                    {completeness.criteria.pricing.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Pricing (+10%)
                      </div>
                      <div className="text-xs font-bold truncate">
                        {calculatedDiscount}% Off valid
                      </div>
                    </div>
                  </div>

                  {/* Criterion 6: SKU & Stock */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      completeness.criteria.stockSku.passed
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                        : "bg-amber-50/80 border-amber-200 text-amber-900"
                    }`}
                  >
                    {completeness.criteria.stockSku.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        SKU/Stock (+10%)
                      </div>
                      <div className="text-xs font-bold truncate">
                        {formData.stock} units
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Interactive Side-by-Side Design Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Panel: Form & Image Auditor (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Tab Navigation for Editor */}
              <div className="bg-white rounded-2xl p-2 border border-[#E8DCC8] shadow-xs flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab("attributes")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "attributes"
                      ? "bg-[#651F35] text-white shadow-sm"
                      : "text-[#6B5E51] hover:bg-[#FAF7F2] hover:text-[#25201D]"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Design & Fabric Specs</span>
                </button>

                <button
                  onClick={() => setActiveTab("pricing")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "pricing"
                      ? "bg-[#651F35] text-white shadow-sm"
                      : "text-[#6B5E51] hover:bg-[#FAF7F2] hover:text-[#25201D]"
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Pricing & Inventory</span>
                </button>

                <button
                  onClick={() => setActiveTab("gallery")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "gallery"
                      ? "bg-[#651F35] text-white shadow-sm"
                      : "text-[#6B5E51] hover:bg-[#FAF7F2] hover:text-[#25201D]"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Image Angles ({galleryImages.length})</span>
                </button>
              </div>

              {/* Tab Content 1: Design & Fabric Attributes */}
              {activeTab === "attributes" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-xs space-y-6">
                  {/* Saree Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                      Product Title
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full text-sm font-semibold p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* Fabric Material Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#B88A3B]" />
                        <span>Fabric Material</span>
                      </label>
                      <span className="text-[11px] text-[#8B6E32] font-medium">
                        Pure Silk, Banarasi, Kanjivaram, Cotton
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {SAREE_FABRICS.map((fab) => {
                        const isSelected = formData.fabric === fab
                        return (
                          <button
                            key={fab}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, fabric: fab })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#651F35] text-white border-[#651F35] shadow-xs"
                                : "bg-[#FAF7F2] text-[#4A3E31] border-[#E8DCC8] hover:border-[#B88A3B]"
                            }`}
                          >
                            {fab}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Color Shade & Swatches */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-[#B88A3B]" />
                        <span>Primary Color Palette Swatch</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {activeColorSwatch && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-xs"
                            style={{ backgroundColor: activeColorSwatch.hex }}
                          />
                        )}
                        <span className="text-xs font-bold text-[#651F35]">
                          {formData.color || "None Selected"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {SAREE_COLOR_PALETTES.map((swatch) => {
                        const isSelected =
                          formData.color?.toLowerCase() === swatch.name.toLowerCase()
                        return (
                          <button
                            key={swatch.name}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, color: swatch.name })
                            }
                            title={`${swatch.name} (${swatch.hex})`}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-white border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-xs"
                                : "bg-[#FAF7F2] border-[#E8DCC8] hover:bg-white"
                            }`}
                          >
                            <span
                              className="w-5 h-5 rounded-full border border-black/10 shadow-inner shrink-0"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            <span className="text-[10px] text-[#25201D] truncate w-full text-center font-medium">
                              {swatch.name.split(" ")[0]}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Occasion Categorization */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#B88A3B]" />
                      <span>Target Occasion</span>
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {SAREE_OCCASIONS.map((occ) => {
                        const isSelected = formData.occasion === occ
                        return (
                          <button
                            key={occ}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, occasion: occ })
                            }
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#D4AF37] text-[#181214] border-[#B88A3B] shadow-xs"
                                : "bg-[#FAF7F2] text-[#6B5E51] border-[#E8DCC8] hover:border-[#D4AF37]"
                            }`}
                          >
                            {occ}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Categories & Curated Collection dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                        Category
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({ ...formData, category_id: e.target.value })
                        }
                        className="w-full text-xs p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                        Curated Collection
                      </label>
                      <select
                        value={formData.collection_id}
                        onChange={(e) =>
                          setFormData({ ...formData, collection_id: e.target.value })
                        }
                        className="w-full text-xs p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                      >
                        <option value="">Select Collection</option>
                        {collections.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description & Styling Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                      Weave & Styling Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Detailed saree weave, zari purity, and styling recommendation..."
                      className="w-full text-xs p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Tab Content 2: Pricing & Inventory */}
              {activeTab === "pricing" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-xs space-y-6">
                  {/* Pricing Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                        Selling Price (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#651F35]">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: Number(e.target.value),
                            })
                          }
                          className="w-full text-sm font-bold pl-7 pr-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                        MRP (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C8074]">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={formData.mrp}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              mrp: Number(e.target.value),
                            })
                          }
                          className="w-full text-sm font-bold pl-7 pr-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Calculated Discount Pill */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                        Calculated Discount
                      </label>
                      <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700">
                          {calculatedDiscount}% OFF
                        </span>
                        <span className="text-[11px] text-[#8C8074]">
                          Saves ₹{(formData.mrp - formData.price).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SKU & Stock Units */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                        SKU Identifier
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                        className="w-full text-xs font-semibold p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                          Inventory Stock Count
                        </label>
                        {formData.stock < 10 && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Low Stock Alert
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock: Number(e.target.value),
                          })
                        }
                        className="w-full text-xs font-bold p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] text-[#25201D] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Storefront Badges & Visibility */}
                  <div className="space-y-3 pt-2 border-t border-[#F0E6D8]">
                    <label className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                      Storefront Badges & Visibility Toggles
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.is_new}
                          onChange={(e) =>
                            setFormData({ ...formData, is_new: e.target.checked })
                          }
                          className="rounded text-[#651F35] focus:ring-[#D4AF37] h-4 w-4"
                        />
                        <span className="text-xs font-semibold text-[#25201D]">
                          NEW Arrival
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.is_bestseller}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              is_bestseller: e.target.checked,
                            })
                          }
                          className="rounded text-[#651F35] focus:ring-[#D4AF37] h-4 w-4"
                        />
                        <span className="text-xs font-semibold text-[#25201D]">
                          Best Seller
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              is_featured: e.target.checked,
                            })
                          }
                          className="rounded text-[#651F35] focus:ring-[#D4AF37] h-4 w-4"
                        />
                        <span className="text-xs font-semibold text-[#25201D]">
                          Featured
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DCC8] cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              is_active: e.target.checked,
                            })
                          }
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span className="text-xs font-semibold text-[#25201D]">
                          Published Live
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 3: Visual Image Gallery Auditor */}
              {activeTab === "gallery" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E8DCC8] shadow-xs space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-[#25201D] uppercase tracking-wider">
                      Visual Angle Hierarchy & Reordering
                    </h4>
                    <p className="text-xs text-[#6B5E51] mt-0.5">
                      Angle 0 is always the primary cover drape. Saree shoppers require at least primary + pallu/zari close-up.
                    </p>
                  </div>

                  {/* Add New Saree Angle via File Upload */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DCC8] space-y-3">
                    <AdminImageUpload
                      value={newImageUrl}
                      onChange={(url) => {
                        if (url && currentSaree) {
                          addProductImage(currentSaree.id, url)
                          setNewImageUrl("")
                        }
                      }}
                      bucket="product-images"
                      label="Upload New Saree Angle (Pallu, Pleats, Border)"
                      aspectRatio="3/4"
                      prefix="saree-angle"
                      placeholderText="Drop saree angle photo here, or click to upload from computer"
                    />
                  </div>

                  {/* Image Angles List */}
                  <div className="space-y-3">
                    {galleryImages.map((img, idx) => {
                      const isPrimary = img.is_primary || idx === 0
                      const angleLabel =
                        IMAGE_ANGLE_LABELS[idx] || `Angle ${idx + 1}`

                      return (
                        <div
                          key={img.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            isPrimary
                              ? "bg-white border-[#D4AF37] ring-1 ring-[#D4AF37]/30 shadow-xs"
                              : "bg-[#FAF7F2] border-[#E8DCC8]"
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-12 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-[#E8DCC8] relative">
                            <img
                              src={img.image_url}
                              alt={angleLabel}
                              className="w-full h-full object-cover"
                            />
                            {isPrimary && (
                              <span className="absolute bottom-0 inset-x-0 bg-[#D4AF37] text-[#181214] text-[8px] font-bold text-center py-0.5">
                                COVER
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#25201D]">
                                {angleLabel}
                              </span>
                              {isPrimary && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  Primary Cover Drape
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#8C8074] truncate mt-0.5 font-mono">
                              {img.image_url}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Move Up/Left */}
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, idx - 1)}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-white border border-[#E8DCC8] text-[#25201D] hover:bg-[#FAF7F2] disabled:opacity-30 cursor-pointer"
                              title="Move angle up"
                            >
                              <MoveLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down/Right */}
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, idx + 1)}
                              disabled={idx === galleryImages.length - 1}
                              className="p-1.5 rounded-lg bg-white border border-[#E8DCC8] text-[#25201D] hover:bg-[#FAF7F2] disabled:opacity-30 cursor-pointer"
                              title="Move angle down"
                            >
                              <MoveRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Set as Primary */}
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() =>
                                  setProductPrimaryImage(currentSaree.id, img.id)
                                }
                                className="px-2.5 py-1 rounded-lg bg-white border border-[#D4AF37] text-[11px] font-semibold text-[#8B6E32] hover:bg-[#D4AF37] hover:text-[#181214] transition-colors cursor-pointer"
                              >
                                Set Cover
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() =>
                                removeProductImage(currentSaree.id, img.id)
                              }
                              className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Remove image angle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Live Storefront Simulator (5 Cols) */}
            <div className="lg:col-span-5 sticky top-20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B6E32] uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-[#D4AF37]" />
                  <span>Live Storefront Simulator</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                  ● Real-time Rendering
                </span>
              </div>

              {/* Simulated Customer Product Card */}
              <div className="bg-white rounded-3xl border-2 border-[#D4AF37]/40 shadow-xl overflow-hidden group">
                {/* Image Stage */}
                <div className="relative aspect-[3/4] bg-[#FAF7F2] overflow-hidden">
                  <img
                    src={activeImage}
                    alt={formData.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Badges on Image */}
                  <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
                    {formData.is_bestseller && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#D4AF37] to-[#B88A3B] text-[#181214] shadow-md">
                        BESTSELLER
                      </span>
                    )}
                    {formData.is_new && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#651F35] text-white shadow-md">
                        NEW ARRIVAL
                      </span>
                    )}
                    {calculatedDiscount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/90 backdrop-blur-xs text-[#651F35] border border-[#651F35]/20 shadow-xs">
                        FLAT {calculatedDiscount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Simulated Wishlist Button */}
                  <div className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#25201D] shadow-md">
                    <Heart className="w-4 h-4" />
                  </div>

                  {/* Angle Switcher Thumbnails on Card */}
                  {galleryImages.length > 1 && (
                    <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl">
                      {galleryImages.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setActiveAngleIndex(idx)}
                          className={`w-7 h-9 rounded-md overflow-hidden border transition-all cursor-pointer ${
                            activeAngleIndex === idx
                              ? "border-[#D4AF37] ring-1 ring-[#D4AF37] scale-105"
                              : "border-white/40 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saree Shopper Details */}
                <div className="p-5 space-y-3.5 bg-white">
                  {/* Fabric & Occasion Luxury Tags */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#8B6E32] uppercase tracking-wider">
                        {formData.fabric || "Pure Saree"}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-[11px] text-[#6B5E51]">
                        {formData.occasion || "Exclusive"}
                      </span>
                    </div>

                    {/* Color Swatch Pill */}
                    {activeColorSwatch && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DCC8]">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: activeColorSwatch.hex }}
                        />
                        <span className="text-[10px] font-medium text-[#25201D]">
                          {formData.color}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-serif text-lg font-bold text-[#25201D] leading-snug">
                    {formData.name || "Untitled Royal Saree"}
                  </h4>

                  {/* Price & MRP Row */}
                  <div className="flex items-baseline gap-2.5 pt-1">
                    <span className="font-serif text-xl font-bold text-[#651F35]">
                      ₹{formData.price?.toLocaleString("en-IN")}
                    </span>
                    {formData.mrp > formData.price && (
                      <span className="text-xs line-through text-[#8C8074]">
                        ₹{formData.mrp?.toLocaleString("en-IN")}
                      </span>
                    )}
                    {calculatedDiscount > 0 && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ({calculatedDiscount}% off)
                      </span>
                    )}
                  </div>

                  {/* Stock Availability Indicator */}
                  <div className="text-xs pt-1">
                    {formData.stock > 0 ? (
                      formData.stock < 10 ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Hurry! Only {formData.stock} pieces remaining in stock
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          ✓ In Stock · Ready for Immediate Dispatch
                        </span>
                      )
                    ) : (
                      <span className="text-rose-600 font-semibold">
                        Sold Out · Join Back-in-Stock Waitlist
                      </span>
                    )}
                  </div>

                  {/* Simulated Add to Bag Button */}
                  <div className="pt-2">
                    <div className="w-full py-3 rounded-xl bg-[#651F35] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md">
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO BAG</span>
                    </div>
                  </div>

                  {/* Authenticity Guarantee Footer */}
                  <div className="text-center pt-2 border-t border-[#F0E6D8] text-[10px] text-[#8C8074]">
                    Handcrafted Pure Zari Weave · Authentic Trendy Sisters Guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E8DCC8] shadow-xs">
          <ShieldCheck className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-[#25201D]">
            No Sarees Match the Selected Filter
          </h3>
          <p className="text-xs text-[#6B5E51] mt-1">
            Try resetting your search query or choosing another filter pill.
          </p>
          <button
            onClick={() => {
              setAuditFilter("all")
              setSearchQuery("")
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#651F35] text-white text-xs font-semibold hover:bg-[#501829] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
