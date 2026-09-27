import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, Heart, ShieldCheck, Truck, Users, Clock, MapPin, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us — Three Sisters, One Dream",
  description:
    "Discover the story of Trendy Sisters. Preserving traditional Indian saree craftsmanship, empowering local artisans, and curating handpicked sarees for women everywhere.",
}

export default function AboutPage() {
  const highlights = [
    {
      icon: Sparkles,
      title: "Handpicked Authenticity",
      desc: "Every drape is meticulously chosen from heritage weaving clusters across Kanchipuram, Varanasi, Uppada, and beyond.",
    },
    {
      icon: Users,
      title: "Empowering Master Artisans",
      desc: "We bridge generations of weaver families directly with conscious saree lovers, celebrating true craft over mass production.",
    },
    {
      icon: ShieldCheck,
      title: "Uncompromised Quality",
      desc: "Pure silks, delicate organzas, breathable linens, and rich Banarasi zaris verified for pure texture, drape, and longevity.",
    },
    {
      icon: Clock,
      title: "24/7 Dedicated Care",
      desc: "From bespoke styling advice to order updates, our family is always one WhatsApp message away.",
    },
  ]

  const milestones = [
    {
      year: "The Spark",
      title: "Three Sisters, One Dream",
      desc: "Growing up surrounded by South Indian handlooms, three sisters shared a lifelong dream to celebrate saree heritage with the modern world.",
    },
    {
      year: "The Journey",
      title: "Direct from the Looms",
      desc: "We set out to partner directly with generational weaving clusters in Andhra Pradesh and Tamil Nadu, cutting out middlemen.",
    },
    {
      year: "Today",
      title: "A Trusted Saree Destination",
      desc: "Serving thousands of brides, families, and everyday saree lovers across India with timeless elegance and warmth.",
    },
  ]

  return (
    <div className="w-full" style={{ backgroundColor: "var(--ivory)" }}>
      {/* Hero Section */}
      <section
        className="relative py-16 sm:py-24 text-center px-4 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, var(--ivory-dark) 0%, var(--ivory) 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <span
            className="inline-block text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full border"
            style={{
              borderColor: "var(--gold)",
              color: "var(--burgundy)",
              backgroundColor: "rgba(184, 138, 59, 0.1)",
            }}
          >
            Our Story & Heritage
          </span>
          <h1
            className="font-serif text-3xl sm:text-5xl font-bold tracking-tight"
            style={{ color: "var(--burgundy)" }}
          >
            Three Sisters, One Dream
          </h1>
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--charcoal-light)" }}
          >
            Trendy Sisters was born from a shared love for India’s timeless handlooms. We
            bring you genuine silks, breathtaking bridal zaris, and everyday grace straight from
            master artisans.
          </p>
        </div>
      </section>

      {/* Main Story Narrative */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <h2
              className="font-serif text-2xl sm:text-4xl font-bold leading-snug"
              style={{ color: "var(--burgundy)" }}
            >
              Every Saree Tells a Tale of Craft, Heritage & Family
            </h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--charcoal-light)" }}>
              At Trendy Sisters, sarees are more than six yards of fabric; they are living testaments
              to generations of craftsmanship. Whether it is a bride choosing her heirloom Kanjivaram,
              a mother celebrating a festive pooja, or a young professional wrapping herself in a crisp
              linen drape, our mission is to make every woman feel regal.
            </p>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--charcoal-light)" }}>
              Operating from Kadirinaidu Palli, Andhra Pradesh, we maintain intimate relationships
              with the master weavers who spend weeks and sometimes months perfecting each motif, pallu,
              and border.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all shadow-md hover:opacity-90"
                style={{ backgroundColor: "var(--burgundy)" }}
              >
                Explore Sarees <ArrowRight size={16} />
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all hover:bg-black/5"
                style={{ borderColor: "var(--burgundy)", color: "var(--burgundy)" }}
              >
                Contact Our Team
              </Link>
            </div>
          </div>

          <div
            className="rounded-2xl p-8 sm:p-10 border shadow-sm relative overflow-hidden"
            style={{
              backgroundColor: "white",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: "var(--gold)" }}
            />
            <h3
              className="font-serif text-xl sm:text-2xl font-bold mb-6"
              style={{ color: "var(--burgundy)" }}
            >
              Our Guiding Values
            </h3>
            <div className="space-y-6">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--ivory-dark)", color: "var(--burgundy)" }}
                  >
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base" style={{ color: "var(--charcoal)" }}>
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--charcoal-light)" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section
        className="py-14 sm:py-20 px-4"
        style={{ backgroundColor: "var(--ivory-dark)", borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold" style={{ color: "var(--burgundy)" }}>
            Our Journey
          </h2>
          <p className="text-sm sm:text-base mt-2" style={{ color: "var(--charcoal-light)" }}>
            How three sisters turned passion into a community of thousands.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border shadow-sm flex flex-col justify-between"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md inline-block mb-3"
                  style={{ backgroundColor: "rgba(101, 31, 53, 0.08)", color: "var(--burgundy)" }}
                >
                  {m.year}
                </span>
                <h3 className="font-serif text-lg font-bold mb-2" style={{ color: "var(--charcoal)" }}>
                  {m.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--charcoal-light)" }}>
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Store & Location Card */}
      <section className="max-w-5xl mx-auto px-4 py-14 sm:py-20 text-center">
        <div
          className="rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden"
          style={{ backgroundColor: "var(--burgundy)" }}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold">
              Visit or Connect With Us
            </h2>
            <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed">
              M63R+QH8 Kadirinaidu Palli, Padamatinaidupalle, Andhra Pradesh 524302, India
            </p>
            <p className="text-xs sm:text-sm text-ivory/90 font-medium">
              Open 24 Hours &nbsp;|&nbsp; WhatsApp & Calling: +91 63041 44691
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <a
                href="https://wa.me/916304144691"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white text-burgundy shadow transition-all hover:bg-ivory"
                style={{ color: "var(--burgundy)" }}
              >
                Chat on WhatsApp
              </a>
              <Link
                href="/shop"
                className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-white/40 text-white transition-all hover:bg-white/10"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
