"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, ChevronDown, MessageCircle, Navigation } from "lucide-react"
import { useState } from "react"

const PHONE = "+916304144691"
const PHONE_DISPLAY = "+91 63041 44691"
const WHATSAPP_URL = `https://wa.me/${PHONE}`
const MAPS_URL = "https://maps.google.com/?q=M63R%2BQH8+Kadirinaidu+Palli+Padamatinaidupalle+Andhra+Pradesh+524302+India"

const InstagramIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
const FacebookIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const YoutubeIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>

const footerSections = [
  {
    title: "Shop",
    links: [
      { label: "All Sarees", href: "/shop" },
      { label: "Silk Sarees", href: "/category/silk-sarees" },
      { label: "Banarasi Sarees", href: "/category/banarasi-sarees" },
      { label: "Wedding Sarees", href: "/category/wedding-sarees" },
      { label: "New Arrivals", href: "/shop?filter=new" },
      { label: "Best Sellers", href: "/shop?filter=bestseller" },
    ],
  },
  {
    title: "Collections",
    links: [
      { label: "The Wedding Edit", href: "/collections/wedding-edit" },
      { label: "Festive Luxe", href: "/collections/festive-luxe" },
      { label: "Summer Pastels", href: "/collections/summer-pastels" },
      { label: "Heritage Weaves", href: "/collections/heritage-weaves" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Returns & Exchange", href: "/returns" },
      { label: "FAQ", href: "/faq" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Contact Support", href: "/support" },
      { label: "Track Order", href: "/account/orders" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Story", href: "/about#story" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
]

function AccordionSection({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-left"
      >
        <span
          className="font-semibold text-sm uppercase tracking-wider"
          style={{ color: "var(--gold)" }}
        >
          {title}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: "var(--gold)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        />
      </button>
      {open && (
        <ul className="pb-3 space-y-2.5 pl-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm transition-colors hover:text-ivory"
                style={{ color: "#C5B49A" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--charcoal)", color: "var(--ivory)" }}>
      {/* Newsletter bar */}
      <div
        className="w-full py-8 px-4 sm:px-6"
        style={{ background: "linear-gradient(135deg, var(--burgundy), var(--burgundy-light))" }}
      >
        <div className="w-full max-w-7xl mx-auto">
          <div className="mb-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:mb-0">
            <div className="mb-4 sm:mb-0">
              <h3 className="font-serif text-xl font-bold text-white mb-1">
                Get 10% Off Your First Order
              </h3>
              <p className="text-white/75 text-sm">
                Join our saree-loving community for new collections &amp; exclusive offers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto sm:flex-shrink-0">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full sm:w-64 px-4 py-2.5 rounded-xl outline-none text-sm placeholder:text-white/60"
                style={{
                  backgroundColor: "rgba(255,249,239,0.15)",
                  border: "1px solid rgba(255,249,239,0.3)",
                  color: "white",
                }}
              />
              <button
                type="button"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "var(--gold)", color: "white" }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: full link grid | Mobile: accordion sections */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">

        {/* Mobile accordion */}
        <div className="block lg:hidden py-4">
          {/* Brand brief on mobile */}
          <div className="py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center"
                style={{ borderColor: "var(--gold)", backgroundColor: "var(--ivory)" }}
              >
                <Image src="/logo.png" alt="Trendy Sisters" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <div className="font-serif font-bold text-base text-ivory">Trendy Sisters</div>
                <div className="text-xs" style={{ color: "var(--gold)" }}>Three Sisters, One Dream</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              {[
                { icon: InstagramIcon, label: "Instagram", href: "#" },
                { icon: FacebookIcon, label: "Facebook", href: "#" },
                { icon: YoutubeIcon, label: "YouTube", href: "#" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: "rgba(184,138,59,0.2)", color: "var(--gold)" }}
                >
                  <s.icon />
                </Link>
              ))}
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2 text-xs" style={{ color: "#C5B49A" }}>
                <Phone size={12} style={{ color: "var(--gold)" }} />
                <span>{PHONE_DISPLAY}</span>
              </div>
              <div className="flex items-start gap-2 text-xs" style={{ color: "#C5B49A" }}>
                <MapPin size={12} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
                <span>Kadirinaidu Palli, Padamatinaidupalle,<br />Andhra Pradesh 524302</span>
              </div>
            </div>
            {/* Contact action buttons - mobile */}
            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:${PHONE}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "var(--gold)", color: "white" }}
              >
                <Phone size={11} />
                Call Now
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#25D366", color: "white" }}
              >
                <MessageCircle size={11} />
                WhatsApp
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "rgba(184,138,59,0.2)", color: "var(--gold)", border: "1px solid rgba(184,138,59,0.4)" }}
              >
                <Navigation size={11} />
                Directions
              </a>
            </div>
          </div>

          {footerSections.map((s) => (
            <AccordionSection key={s.title} title={s.title} links={s.links} />
          ))}
        </div>

        {/* Desktop full grid */}
        <div className="hidden lg:grid grid-cols-6 gap-10 py-16">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center bg-ivory"
                style={{ borderColor: "var(--gold)" }}
              >
                <Image src="/logo.png" alt="Trendy Sisters" width={56} height={56} className="object-contain" />
              </div>
              <div>
                <div className="font-serif font-bold text-xl text-ivory">Trendy Sisters</div>
                <div className="text-xs" style={{ color: "var(--gold)" }}>Three Sisters, One Dream</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#C5B49A" }}>
              Sarees That Define Tradition, Designed for Today. Explore our curated collection of premium Indian sarees — open 24 hours, every day.
            </p>
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm" style={{ color: "#C5B49A" }}>
                <Phone size={14} style={{ color: "var(--gold)" }} /><span>{PHONE_DISPLAY}</span>
              </div>
              <div className="flex items-start gap-2 text-sm" style={{ color: "#C5B49A" }}>
                <MapPin size={14} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 3 }} /><span>Kadirinaidu Palli, Padamatinaidupalle,<br />Andhra Pradesh 524302, India</span>
              </div>
            </div>
            {/* Contact action buttons - desktop */}
            <div className="flex flex-wrap gap-2 mb-6">
              <a
                href={`tel:${PHONE}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "var(--gold)", color: "white" }}
              >
                <Phone size={13} />
                Call Now
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#25D366", color: "white" }}
              >
                <MessageCircle size={13} />
                WhatsApp
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "rgba(184,138,59,0.2)", color: "var(--gold)", border: "1px solid rgba(184,138,59,0.4)" }}
              >
                <Navigation size={13} />
                Get Directions
              </a>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: InstagramIcon, label: "Instagram", href: "#" },
                { icon: FacebookIcon, label: "Facebook", href: "#" },
                { icon: YoutubeIcon, label: "YouTube", href: "#" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: "rgba(184,138,59,0.2)", color: "var(--gold)" }}
                >
                  <s.icon />
                </Link>
              ))}
            </div>
          </div>

          {footerSections.map((s) => (
            <div key={s.title}>
              <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider" style={{ color: "var(--gold)" }}>
                {s.title}
              </h4>
              <ul className="space-y-2.5">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm transition-colors hover:text-ivory"
                      style={{ color: "#C5B49A" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t px-4 sm:px-6 py-4"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "#7A6B5A" }}>
            © 2024 Trendy Sisters. All rights reserved. | Made with ♥ in India
          </p>
          <div className="flex items-center gap-2">
            {["visa", "mastercard", "upi", "razorpay"].map((p) => (
              <span
                key={p}
                className="px-2 py-1 rounded text-[10px] font-semibold uppercase"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#9B8A7A" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
