"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getSafeImageUrl, DEFAULT_BANNER_IMAGE } from "@/lib/image-utils"
import type { Banner } from "@/types"

const fallbackBanners = [
  {
    id: "1",
    title: "Elegance in Every Drape",
    subtitle: "Discover timeless sarees crafted for modern celebrations.",
    image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&h=700&fit=crop&q=80",
    link_url: "/shop",
  },
  {
    id: "2",
    title: "The Wedding Edit 2024",
    subtitle: "Celebrate your special moments in timeless elegance.",
    image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1400&h=700&fit=crop&q=80",
    link_url: "/collections/wedding-edit",
  },
  {
    id: "3",
    title: "Festive Luxe Collection",
    subtitle: "Celebrate every festival in premium sarees.",
    image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1400&h=700&fit=crop&q=80",
    link_url: "/collections/festive-luxe",
  },
]

export function HeroSection() {
  const [banners, setBanners] = useState<typeof fallbackBanners>(fallbackBanners)
  const [current, setCurrent] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBanners(
            (data as any[]).map((b) => ({
              ...b,
              image_url: getSafeImageUrl(b.image_url, DEFAULT_BANNER_IMAGE),
            }))
          )
        }
      })
  }, [supabase])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length)
  const next = () => setCurrent((c) => (c + 1) % banners.length)

  const banner = banners[current]

  return (
    <section className="w-full px-3 sm:px-4 lg:px-6 pt-3 pb-1 max-w-7xl mx-auto">
      <div
        className="relative overflow-hidden rounded-2xl aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.2/1]"
      >
        {/* Background image */}
        <Image
          src={getSafeImageUrl(banner.image_url, DEFAULT_BANNER_IMAGE)}
          alt={banner.title}
          fill
          className="object-cover transition-all duration-700"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1400px) 90vw, 1400px"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(37,32,29,0.88) 0%, rgba(37,32,29,0.5) 55%, rgba(37,32,29,0.1) 100%)",
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex items-center px-5 sm:px-8 lg:px-16">
          <div className="w-full max-w-sm animate-fade-in" key={current}>
            {/* Tag */}
            <div
              className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2 sm:mb-3"
              style={{ backgroundColor: "var(--gold)", color: "white" }}
            >
              ✦ New Collection
            </div>

            <h1
              className="font-serif font-bold text-white leading-tight mb-2"
              style={{ fontSize: "clamp(1.3rem, 5vw, 3rem)" }}
            >
              {banner.title}
            </h1>

            {banner.subtitle && (
              <p className="text-white/80 mb-4 max-w-xs" style={{ fontSize: "clamp(0.75rem, 2.5vw, 1rem)" }}>
                {banner.subtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Link
                href={banner.link_url || "/shop"}
                className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: "var(--gold)", color: "white", fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
              >
                Shop Sarees
              </Link>
              <Link
                href="/collections"
                className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.4)",
                  backdropFilter: "blur(8px)",
                  fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
                }}
              >
                Collections
              </Link>
            </div>
          </div>
        </div>

        {/* Nav arrows — hidden on xs, visible on sm+ */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(8px)" }}
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(8px)" }}
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="transition-all duration-300"
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === current ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === current ? "var(--gold)" : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
