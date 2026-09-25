"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { getSafeImageUrl } from "@/lib/image-utils"
import type { SearchSuggestion } from "@/types"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined as any)

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!q.trim() || q.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const [{ data: products }, { data: categories }] = await Promise.all([
          supabase
            .from("products")
            .select("id, name, slug, fabric, product_images(image_url)")
            .ilike("name", `%${q}%`)
            .eq("is_active", true)
            .limit(5),
          supabase
            .from("categories")
            .select("id, name, slug, image_url")
            .ilike("name", `%${q}%`)
            .eq("is_active", true)
            .limit(3),
        ])

        const productSuggestions: SearchSuggestion[] = (products || []).map((p: any) => ({
          type: "product" as const,
          id: p.id,
          name: p.name,
          slug: p.slug,
          image_url: p.product_images?.[0]?.image_url || null,
        }))

        const categorySuggestions: SearchSuggestion[] = (categories || []).map((c: any) => ({
          type: "category" as const,
          id: c.id,
          name: c.name,
          slug: c.slug,
          image_url: c.image_url,
        }))

        setSuggestions([...categorySuggestions, ...productSuggestions])
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, fetchSuggestions])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--burgundy)" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search sarees, silk sarees, wedding collections..."
          className="w-full pl-11 pr-24 py-3 rounded-full text-sm outline-none transition-all"
          style={{
            backgroundColor: "var(--ivory-dark)",
            border: "1.5px solid var(--border)",
            color: "var(--charcoal)",
          }}
          onMouseEnter={(e) => {
            ;(e.target as HTMLInputElement).style.borderColor = "var(--burgundy)"
          }}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.target) {
              ;(e.target as HTMLInputElement).style.borderColor = "var(--border)"
            }
          }}
          onFocusCapture={(e) => {
            ;(e.target as HTMLInputElement).style.borderColor = "var(--burgundy)"
          }}
          onBlurCapture={(e) => {
            ;(e.target as HTMLInputElement).style.borderColor = "var(--border)"
          }}
        />

        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setSuggestions([]) }}
            className="absolute right-20 top-1/2 -translate-y-1/2 p-1"
            style={{ color: "#9B8A7A" }}
          >
            <X size={14} />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: "var(--burgundy)" }}
        >
          Search
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {open && (query.length >= 2) && (
        <div
          className="absolute top-full mt-2 left-0 right-0 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in"
          style={{ border: "1px solid var(--border)", backgroundColor: "white" }}
        >
          {loading ? (
            <div className="flex items-center justify-center p-6 gap-2" style={{ color: "var(--burgundy)" }}>
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.some(s => s.type === "category") && (
                <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--gold)" }}>
                  Categories
                </div>
              )}
              {suggestions
                .filter(s => s.type === "category")
                .map(s => (
                  <Link
                    key={s.id}
                    href={`/category/${s.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-ivory transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {s.image_url && (
                      <Image src={getSafeImageUrl(s.image_url)} alt={s.name} width={36} height={36}
                        className="rounded-lg object-cover" />
                    )}
                    <span className="text-sm font-medium" style={{ color: "var(--charcoal)" }}>{s.name}</span>
                  </Link>
                ))}

              {suggestions.some(s => s.type === "product") && (
                <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border-t mt-1 pt-2.5"
                  style={{ color: "var(--gold)", borderColor: "var(--border)" }}>
                  Products
                </div>
              )}
              {suggestions
                .filter(s => s.type === "product")
                .map(s => (
                  <Link
                    key={s.id}
                    href={`/product/${s.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-ivory transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {s.image_url && (
                      <Image src={getSafeImageUrl(s.image_url)} alt={s.name} width={36} height={45}
                        className="rounded-lg object-cover" style={{ aspectRatio: "4/5" }} />
                    )}
                    <span className="text-sm" style={{ color: "var(--charcoal)" }}>{s.name}</span>
                  </Link>
                ))}

              <div
                className="px-4 py-3 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                <button
                  onClick={handleSubmit as any}
                  className="text-sm font-medium"
                  style={{ color: "var(--burgundy)" }}
                >
                  View all results for &quot;{query}&quot; →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-sm" style={{ color: "#9B8A7A" }}>
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
