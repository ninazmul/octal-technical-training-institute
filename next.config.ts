import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  // Next.js >=16.3 enables prerender source maps by default, which sharply
  // increases memory during the "Generating static pages" phase and crashes
  // memory-constrained build hosts.
  enablePrerenderSourceMaps: false,
  experimental: {
    // The build host reports ~61 CPUs but has limited RAM, so Next's default of
    // cpus - 1 (60) parallel workers exhausts memory before any page finishes.
    cpus: 4,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io", port: "" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/assets/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
