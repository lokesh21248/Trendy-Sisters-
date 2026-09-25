import { Star, Truck, RefreshCw, ShieldCheck, Headphones, Award } from "lucide-react"

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On all orders above ₹999 across India",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    desc: "15-day hassle-free returns & exchanges",
  },
  {
    icon: ShieldCheck,
    title: "Authentic Sarees",
    desc: "100% genuine handwoven sarees with authenticity certificate",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Dedicated customer support via call & chat",
  },
  {
    icon: Star,
    title: "Premium Quality",
    desc: "Carefully curated from India's finest weavers",
  },
  {
    icon: Award,
    title: "Sisters' Promise",
    desc: "Every saree personally selected with love and care for our customers",
  },
]

const reviews = [
  {
    name: "Priya Sharma",
    city: "Mumbai",
    rating: 5,
    text: "The Kanjivaram silk saree I ordered was absolutely stunning. The quality surpassed my expectations. Perfect for my daughter's wedding!",
    product: "Kanjivaram Silk Saree",
  },
  {
    name: "Ananya Krishnan",
    city: "Chennai",
    rating: 5,
    text: "I've ordered 3 sarees from Trendy Sisters so far and every single one has been beautiful. The packaging is premium and delivery is super fast.",
    product: "Banarasi Silk Saree",
  },
  {
    name: "Meera Patel",
    city: "Ahmedabad",
    rating: 5,
    text: "The cotton sarees are so comfortable for daily wear. Exactly as shown in the pictures. Very happy with my purchase!",
    product: "Cotton Saree",
  },
]

export function WhyUsSection() {
  return (
    <>
      {/* Why Trendy Sisters */}
      <section
        className="px-3 sm:px-4 lg:px-6 py-10 lg:py-16"
        style={{ backgroundColor: "var(--charcoal)" }}
      >
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2
              className="font-serif font-bold mb-2"
              style={{ color: "var(--ivory)", fontSize: "clamp(1.3rem, 5vw, 2.25rem)" }}
            >
              Why Trendy Sisters?
            </h2>
            <p style={{ color: "#9B8A7A" }} className="text-sm">
              Our promise to every customer
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center text-center p-4 sm:p-5 lg:p-6 rounded-xl transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(184,138,59,0.2)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(184,138,59,0.15)" }}
                >
                  <f.icon size={20} style={{ color: "var(--gold)" }} />
                </div>
                <h3
                  className="font-semibold mb-1"
                  style={{ color: "var(--ivory)", fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
                >
                  {f.title}
                </h3>
                <p className="text-[11px] leading-relaxed" style={{ color: "#9B8A7A" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="w-full px-3 sm:px-4 lg:px-6 py-8 max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="section-heading">What Our Customers Say</h2>
          <p className="text-sm mt-1" style={{ color: "#9B8A7A" }}>
            Loved by thousands of women across India
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} fill="var(--gold)" stroke="var(--gold)" />
            ))}
            <span className="font-bold text-sm ml-1" style={{ color: "var(--charcoal)" }}>
              4.8
            </span>
            <span className="text-sm" style={{ color: "#9B8A7A" }}>
              (1,200+ reviews)
            </span>
          </div>
        </div>

        {/* Mobile: horizontal swipe with peek effect | Desktop: grid */}
        <div className="review-scroll md:grid md:grid-cols-3 md:gap-5 px-1 pb-2 snap-x snap-mandatory">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="review-card snap-start p-4 sm:p-5 rounded-2xl md:w-auto shrink-0 shadow-sm"
              style={{
                backgroundColor: "white",
                border: "1px solid var(--border)",
                width: "min(290px, 78vw)",
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    fill={s <= r.rating ? "var(--gold)" : "none"}
                    stroke={s <= r.rating ? "var(--gold)" : "#D5C4A1"}
                  />
                ))}
              </div>

              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--charcoal)" }}>
                &ldquo;{r.text}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>
                    {r.name}
                  </div>
                  <div className="text-[11px]" style={{ color: "#9B8A7A" }}>
                    {r.city}
                  </div>
                </div>
                <span
                  className="text-[10px] px-2 py-1 rounded-md font-medium"
                  style={{ backgroundColor: "var(--ivory-dark)", color: "var(--burgundy)" }}
                >
                  {r.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
