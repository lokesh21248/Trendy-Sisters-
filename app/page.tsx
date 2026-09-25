import { HeroSection } from "@/components/home/HeroSection"
import { CategorySection } from "@/components/home/CategorySection"
import { ProductSection } from "@/components/home/ProductSection"
import { FeaturedCollection } from "@/components/home/FeaturedCollection"
import { OccasionSection } from "@/components/home/OccasionSection"
import { WhyUsSection } from "@/components/home/WhyUsSection"
import Link from "next/link"

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "var(--ivory)" }} className="w-full overflow-x-hidden">
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Shop by Category */}
      <CategorySection />

      {/* 3. New Arrivals */}
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh from our weavers, just for you"
        viewAllHref="/shop?filter=new"
        viewAllLabel="View all"
        filter="new"
      />

      {/* 4. Featured Collection */}
      <FeaturedCollection />

      {/* 5. Best Sellers */}
      <ProductSection
        title="Best Sellers"
        subtitle="Loved by thousands of women"
        viewAllHref="/shop?filter=bestseller"
        viewAllLabel="Browse all"
        filter="bestseller"
      />

      {/* 6. Shop by Occasion */}
      <OccasionSection />

      {/* 7. Promo Banner */}
      <section className="w-full px-3 sm:px-4 lg:px-6 py-5 max-w-7xl mx-auto">
        <div
          className="relative overflow-hidden rounded-2xl px-5 sm:px-8 py-8 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, var(--burgundy) 0%, var(--burgundy-light) 50%, var(--gold-dark) 100%)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ backgroundColor: "white", transform: "translate(30%, -40%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
            style={{ backgroundColor: "white", transform: "translate(-30%, 40%)" }}
          />

          <div className="relative z-10 text-white text-center sm:text-left">
            <span
              className="text-xs font-bold uppercase tracking-widest mb-1 block"
              style={{ color: "var(--gold-light)" }}
            >
              Limited Time Offer
            </span>
            <h2 className="font-serif font-bold text-white mb-1" style={{ fontSize: "clamp(1.4rem, 5vw, 2.25rem)" }}>
              Up to 40% Off
            </h2>
            <p className="text-white/80 text-sm">
              Use code{" "}
              <span
                className="font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: "var(--gold)", color: "white" }}
              >
                TRENDY40
              </span>
            </p>
          </div>

          <Link
            href="/shop?filter=sale"
            className="relative z-10 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 whitespace-nowrap"
            style={{ backgroundColor: "white", color: "var(--burgundy)" }}
          >
            Shop the Sale →
          </Link>
        </div>
      </section>

      {/* 8. Why Us + Reviews */}
      <WhyUsSection />
    </div>
  )
}
