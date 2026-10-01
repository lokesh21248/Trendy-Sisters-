import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses
  compress: true,

  // Faster builds & better performance
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@clerk/nextjs",
      "framer-motion",
    ],
  },

  images: {
    // Serve WebP/AVIF for smaller sizes & faster loads
    formats: ["image/avif", "image/webp"],
    // Cache images at CDN for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [390, 640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "efirqiluvuerurnpptfm.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  // Aggressive HTTP caching headers for static assets & API routes
  async headers() {
    return [
      // Static assets: 1 year cache
      {
        source: "/(.*\\.(?:js|css|woff2|woff|ttf|ico|png|jpg|jpeg|svg|webp|avif))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Public API product/category endpoints: cache 60s with stale-while-revalidate
      {
        source: "/api/products(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/api/categories(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      // Admin API: never cache
      {
        source: "/api/admin(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
