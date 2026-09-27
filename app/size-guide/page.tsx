import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Saree & Blouse Sizing Guide — Trendy Sisters",
  description: "Standard dimensions for sarees and measurement guidelines for blouse tailoring.",
}

export default function SizeGuidePage() {
  return (
    <div className="w-full py-12 px-4 max-w-4xl mx-auto space-y-8" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--gold-dark)" }}>
          Fit & Measurements
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2" style={{ color: "var(--burgundy)" }}>
          Saree & Blouse Sizing Guide
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--charcoal-light)" }}>
          Everything you need to know about saree lengths, fall, and blouse sizing.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-white border" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: "var(--burgundy)" }}>
            Standard Saree Dimensions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b" style={{ borderColor: "var(--border)" }}>
                <tr>
                  <th className="py-2.5 font-semibold text-charcoal">Component</th>
                  <th className="py-2.5 font-semibold text-charcoal">Length (Meters)</th>
                  <th className="py-2.5 font-semibold text-charcoal">Length (Yards / Inches)</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs sm:text-sm" style={{ borderColor: "var(--border)" }}>
                <tr>
                  <td className="py-3 font-medium">Saree Body</td>
                  <td className="py-3 text-charcoal-light">5.50 Meters</td>
                  <td className="py-3 text-charcoal-light">~6.0 Yards (216 inches)</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Blouse Piece</td>
                  <td className="py-3 text-charcoal-light">0.80 Meters</td>
                  <td className="py-3 text-charcoal-light">~31.5 Inches</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Total Fabric</td>
                  <td className="py-3 text-charcoal-light">6.30 Meters</td>
                  <td className="py-3 text-charcoal-light">~6.88 Yards</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Width / Height</td>
                  <td className="py-3 text-charcoal-light">1.10 – 1.15 Meters</td>
                  <td className="py-3 text-charcoal-light">43 – 45 Inches</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border space-y-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-serif text-xl font-bold" style={{ color: "var(--burgundy)" }}>
            Standard Blouse Bust Measurements
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light">
            If you are having your blouse stitched by our in-house master tailors or locally:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl border bg-ivory" style={{ borderColor: "var(--border)" }}>
              <div className="font-bold text-sm text-burgundy">Small (S)</div>
              <div className="text-xs text-charcoal-light mt-1">Bust: 32" – 34"</div>
            </div>
            <div className="p-3 rounded-xl border bg-ivory" style={{ borderColor: "var(--border)" }}>
              <div className="font-bold text-sm text-burgundy">Medium (M)</div>
              <div className="text-xs text-charcoal-light mt-1">Bust: 36" – 38"</div>
            </div>
            <div className="p-3 rounded-xl border bg-ivory" style={{ borderColor: "var(--border)" }}>
              <div className="font-bold text-sm text-burgundy">Large (L)</div>
              <div className="text-xs text-charcoal-light mt-1">Bust: 40" – 42"</div>
            </div>
            <div className="p-3 rounded-xl border bg-ivory" style={{ borderColor: "var(--border)" }}>
              <div className="font-bold text-sm text-burgundy">X-Large (XL)</div>
              <div className="text-xs text-charcoal-light mt-1">Bust: 44" – 46"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
