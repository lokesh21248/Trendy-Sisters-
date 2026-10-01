import Image from "next/image"
import Link from "next/link"
import { createStaticClient } from "@/lib/supabase/server"
import { getSafeImageUrl, DEFAULT_BANNER_IMAGE } from "@/lib/image-utils"
import HeroClient from "./HeroClient"

// Fetch banners server-side so the hero appears instantly (no client-side loading flash)
async function getBanners() {
  try {
    const supabase = createStaticClient()
    const { data } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
    return (data || []).map((b: any) => ({
      ...b,
      image_url: getSafeImageUrl(b.image_url, DEFAULT_BANNER_IMAGE),
    }))
  } catch {
    return []
  }
}

export async function HeroSection() {
  const banners = await getBanners()

  if (!banners || banners.length === 0) return null

  return <HeroClient banners={banners} />
}
