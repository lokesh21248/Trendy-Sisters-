import Image from "next/image"
import Link from "next/link"

export function FeaturedCollection() {
  return (
    <section className="w-full px-3 sm:px-4 lg:px-6 py-5 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Main featured */}
        <div
          className="relative overflow-hidden rounded-2xl group"
          style={{ minHeight: 280, aspectRatio: "16/9" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop&q=85"
            alt="The Wedding Edit"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(101,31,53,0.88) 0%, rgba(37,32,29,0.5) 60%, transparent 100%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 lg:p-8">
            <span
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--gold-light)" }}
            >
              Featured Collection
            </span>
            <h2 className="font-serif font-bold text-white mb-2" style={{ fontSize: "clamp(1.25rem, 4vw, 2.25rem)" }}>
              The Wedding Edit
            </h2>
            <p className="text-white/75 text-sm mb-4 max-w-xs">
              Celebrate every moment in timeless elegance.
            </p>
            <Link
              href="/collections/wedding-edit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm self-start transition-all hover:scale-105"
              style={{ backgroundColor: "var(--gold)", color: "white" }}
            >
              Shop Collection →
            </Link>
          </div>
        </div>

        {/* Two smaller features */}
        <div className="grid grid-cols-2 lg:grid-rows-2 lg:grid-cols-1 gap-3 sm:gap-4">
          <div
            className="relative overflow-hidden rounded-xl sm:rounded-2xl group"
            style={{ minHeight: 140, aspectRatio: "4/3" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=400&fit=crop&q=85"
              alt="Festive Luxe"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to right, rgba(37,32,29,0.82), transparent 70%)",
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6">
              <span className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: "var(--gold-light)" }}>
                New Collection
              </span>
              <h3 className="font-serif font-bold text-white mb-2" style={{ fontSize: "clamp(0.9rem, 3vw, 1.5rem)" }}>Festive Luxe</h3>
              <Link
                href="/collections/festive-luxe"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs self-start transition-all hover:scale-105"
                style={{ backgroundColor: "var(--burgundy)", color: "white" }}
              >
                Explore →
              </Link>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-xl sm:rounded-2xl group"
            style={{ minHeight: 140, aspectRatio: "4/3" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&h=400&fit=crop&q=85"
              alt="Heritage Weaves"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to right, rgba(37,32,29,0.82), transparent 70%)",
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6">
              <span className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: "var(--gold-light)" }}>
                Handloom
              </span>
              <h3 className="font-serif font-bold text-white mb-2" style={{ fontSize: "clamp(0.9rem, 3vw, 1.5rem)" }}>Heritage Weaves</h3>
              <Link
                href="/collections/heritage-weaves"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs self-start transition-all hover:scale-105"
                style={{ backgroundColor: "var(--burgundy)", color: "white" }}
              >
                Explore →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
