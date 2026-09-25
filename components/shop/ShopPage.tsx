"use client"

import { useState, useEffect, useCallback, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { ProductCard, ProductCardSkeleton } from "@/components/products/ProductCard"
import { SlidersHorizontal, ChevronDown, X, Check, Search } from "lucide-react"
import { sanitizeProduct } from "@/lib/image-utils"
import type { ProductWithImages, Category } from "@/types"

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Selling", value: "bestseller" },
]

const occasions = ["Wedding", "Festive", "Party", "Office", "Casual"]
const fabrics = ["Pure Silk", "Banarasi Silk", "Cotton", "Georgette", "Chiffon", "Linen", "Chanderi"]

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export function ShopPage({ searchParams }: ShopPageProps) {
  const params = use(searchParams)
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  // Filters
  const [sort, setSort] = useState("featured")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const supabase = createClient()
  const PAGE_SIZE = 12

  // Load categories
  useEffect(() => {
    supabase.from("categories").select("*").eq("is_active", true).order("display_order")
      .then(({ data }) => setCategories(data || []))
  }, [supabase])

  // Build and run query
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("products")
        .select("*, product_images(*)", { count: "exact" })
        .eq("is_active", true)

      // Search
      if (params.q) query = query.ilike("name", `%${params.q}%`)

      // Filters from URL
      if (params.filter === "new") query = query.eq("is_new", true)
      if (params.filter === "bestseller") query = query.eq("is_bestseller", true)
      if (params.occasion) query = query.ilike("occasion", `%${params.occasion}%`)

      // Local filters
      if (selectedCategories.length > 0) query = query.in("category_id", selectedCategories)
      if (selectedOccasions.length > 0) query = query.in("occasion", selectedOccasions)
      if (selectedFabrics.length > 0) query = query.in("fabric", selectedFabrics)
      query = query.gte("price", priceRange[0]).lte("price", priceRange[1])

      // Sort
      switch (sort) {
        case "newest": query = query.order("created_at", { ascending: false }); break
        case "price_asc": query = query.order("price", { ascending: true }); break
        case "price_desc": query = query.order("price", { ascending: false }); break
        case "bestseller": query = query.eq("is_bestseller", true).order("created_at", { ascending: false }); break
        default: query = query.order("created_at", { ascending: false }); break
      }

      // Pagination
      const start = (page - 1) * PAGE_SIZE
      query = query.range(start, start + PAGE_SIZE - 1)

      const { data, count } = await query
      setProducts(((data || []) as any[]).map(sanitizeProduct) as ProductWithImages[])
      setTotal(count || 0)
    } finally {
      setLoading(false)
    }
  }, [supabase, params, selectedCategories, selectedOccasions, selectedFabrics, priceRange, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const toggleFilter = <T extends string>(
    arr: T[], setArr: (a: T[]) => void, val: T
  ) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
    setPage(1)
  }

  const FilterSidebar = (
    <aside className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--charcoal)" }}>Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <div
                className="w-4 h-4 rounded flex items-center justify-center border transition-all"
                style={{
                  borderColor: selectedCategories.includes(cat.id) ? "var(--burgundy)" : "var(--border)",
                  backgroundColor: selectedCategories.includes(cat.id) ? "var(--burgundy)" : "transparent",
                }}
                onClick={() => toggleFilter(selectedCategories, setSelectedCategories, cat.id)}
              >
                {selectedCategories.includes(cat.id) && <Check size={10} color="white" />}
              </div>
              <span className="text-sm group-hover:text-burgundy transition-colors" style={{ color: "var(--charcoal)" }}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--charcoal)" }}>Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
            className="w-full px-2 py-1.5 rounded-lg text-xs border outline-none"
            style={{ borderColor: "var(--border)" }}
            placeholder="Min"
          />
          <span style={{ color: "#9B8A7A" }}>–</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
            className="w-full px-2 py-1.5 rounded-lg text-xs border outline-none"
            style={{ borderColor: "var(--border)" }}
            placeholder="Max"
          />
        </div>
      </div>

      {/* Fabric */}
      <div>
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--charcoal)" }}>Fabric</h3>
        <div className="space-y-2">
          {fabrics.map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer group">
              <div
                className="w-4 h-4 rounded flex items-center justify-center border transition-all"
                style={{
                  borderColor: selectedFabrics.includes(f) ? "var(--burgundy)" : "var(--border)",
                  backgroundColor: selectedFabrics.includes(f) ? "var(--burgundy)" : "transparent",
                }}
                onClick={() => toggleFilter(selectedFabrics, setSelectedFabrics, f)}
              >
                {selectedFabrics.includes(f) && <Check size={10} color="white" />}
              </div>
              <span className="text-sm" style={{ color: "var(--charcoal)" }}>{f}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Occasion */}
      <div>
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--charcoal)" }}>Occasion</h3>
        <div className="flex flex-wrap gap-2">
          {occasions.map((occ) => (
            <button
              key={occ}
              onClick={() => toggleFilter(selectedOccasions, setSelectedOccasions, occ)}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
              style={{
                borderColor: selectedOccasions.includes(occ) ? "var(--burgundy)" : "var(--border)",
                backgroundColor: selectedOccasions.includes(occ) ? "var(--burgundy)" : "transparent",
                color: selectedOccasions.includes(occ) ? "white" : "var(--charcoal)",
              }}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          setSelectedCategories([])
          setSelectedOccasions([])
          setSelectedFabrics([])
          setPriceRange([0, 50000])
        }}
        className="w-full py-2 rounded-xl text-sm font-medium border transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600"
        style={{ borderColor: "var(--border)", color: "#9B8A7A" }}
      >
        Reset all filters
      </button>
    </aside>
  )

  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold" style={{ color: "var(--charcoal)" }}>
            {params.q ? `Results for "${params.q}"` : "All Sarees"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9B8A7A" }}>
            {loading ? "Loading..." : `Showing ${products.length} of ${total} sarees`}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-60 flex-shrink-0">
            <div
              className="sticky top-32 p-5 rounded-2xl"
              style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
            >
              <h2 className="font-semibold text-base mb-5" style={{ color: "var(--charcoal)" }}>Filters</h2>
              {FilterSidebar}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile top bar */}
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--charcoal)" }}
              >
                <SlidersHorizontal size={16} />
                Filter
                {(selectedCategories.length + selectedOccasions.length + selectedFabrics.length) > 0 && (
                  <span
                    className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                    style={{ backgroundColor: "var(--burgundy)" }}
                  >
                    {selectedCategories.length + selectedOccasions.length + selectedFabrics.length}
                  </span>
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 flex-1 justify-center py-2.5 px-4 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "white", border: "1px solid var(--border)", color: "var(--charcoal)" }}
                >
                  Sort <ChevronDown size={14} />
                </button>
                {sortOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-lg z-40 overflow-hidden"
                    style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSort(opt.value); setSortOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-ivory transition-colors flex items-center gap-2"
                        style={{ color: sort === opt.value ? "var(--burgundy)" : "var(--charcoal)" }}
                      >
                        {sort === opt.value && <Check size={12} />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop sort bar */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <div className="flex flex-wrap gap-2">
                {selectedCategories.length + selectedOccasions.length + selectedFabrics.length > 0 && (
                  <button
                    onClick={() => { setSelectedCategories([]); setSelectedOccasions([]); setSelectedFabrics([]) }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs"
                    style={{ backgroundColor: "var(--ivory-dark)", color: "var(--burgundy)" }}
                  >
                    Clear filters <X size={10} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "#9B8A7A" }}>Sort by:</span>
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
                    style={{ borderColor: "var(--border)", color: "var(--charcoal)", backgroundColor: "white" }}
                  >
                    {sortOptions.find((s) => s.value === sort)?.label}
                    <ChevronDown size={14} />
                  </button>
                  {sortOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-lg z-40 overflow-hidden"
                      style={{ backgroundColor: "white", border: "1px solid var(--border)" }}
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSort(opt.value); setSortOpen(false) }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-ivory transition-colors flex items-center gap-2"
                          style={{ color: sort === opt.value ? "var(--burgundy)" : "var(--charcoal)" }}
                        >
                          {sort === opt.value && <Check size={12} />}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: "var(--charcoal)" }}>
                  No sarees found
                </h3>
                <p className="text-sm" style={{ color: "#9B8A7A" }}>
                  Try adjusting your filters or search term
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > PAGE_SIZE && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-sm font-medium border disabled:opacity-40"
                  style={{ borderColor: "var(--border)" }}
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {page} of {Math.ceil(total / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / PAGE_SIZE)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border disabled:opacity-40"
                  style={{ borderColor: "var(--border)" }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="bottom-sheet">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-base" style={{ color: "var(--charcoal)" }}>Filters</h3>
              <button onClick={() => setFilterOpen(false)}>
                <X size={20} style={{ color: "var(--charcoal)" }} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              {FilterSidebar}
            </div>
            <button
              onClick={() => setFilterOpen(false)}
              className="mt-5 w-full py-3 rounded-xl font-semibold text-white text-sm"
              style={{ backgroundColor: "var(--burgundy)" }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
