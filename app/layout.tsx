import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { MobileHeader } from "@/components/layout/MobileHeader"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { Footer } from "@/components/layout/Footer"
import { CartProvider } from "@/contexts/CartContext"
import { WishlistProvider } from "@/contexts/WishlistContext"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Trendy Sisters — Sarees That Define Tradition, Designed for Today",
    template: "%s | Trendy Sisters",
  },
  description:
    "Shop premium Indian sarees — Kanjivaram silk, Banarasi, designer and cotton sarees. Apparel & Clothing store open 24 hours. Free shipping on orders above ₹999.",
  keywords: ["sarees", "silk sarees", "Kanjivaram", "Banarasi", "Indian fashion", "women sarees", "wedding sarees", "Trendy Sisters"],
  authors: [{ name: "Trendy Sisters" }],
  creator: "Trendy Sisters",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Trendy Sisters",
    title: "Trendy Sisters — Premium Indian Sarees",
    description: "Sarees That Define Tradition, Designed for Today",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trendy Sisters — Premium Indian Sarees",
    description: "Sarees That Define Tradition, Designed for Today",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen w-full flex flex-col overflow-x-hidden">
        <CartProvider>
          <WishlistProvider>
            {/* Desktop Header */}
            <div className="hidden md:block w-full">
              <Header />
            </div>
            {/* Mobile Header */}
            <div className="block md:hidden w-full">
              <MobileHeader />
            </div>

            <main className="w-full flex-1">{children}</main>

            <Footer />

            {/* Mobile Bottom Navigation */}
            <div className="block md:hidden">
              <MobileBottomNav />
            </div>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
