import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React strict mode — surface side-effect bugs early
  reactStrictMode: true,

  // Image optimization — whitelist backend storage hosts.
  // Backend CarImage.url points to MinIO (S3-compatible) on :9000 in dev,
  // and AWS S3 in prod. Expand patterns as deployment changes.
  images: {
    remotePatterns: [
      // MinIO local dev (S3-compatible blob storage)
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/**",
      },
      // Spring backend itself (rarely serves images, kept as escape hatch)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      // Production AWS S3
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "veyra-*.s3.*.amazonaws.com",
        pathname: "/**",
      },
    ],
    // AVIF first, WebP fallback (BRANDING.md §9.1)
    formats: ["image/avif", "image/webp"],
    // Next.js 16 added an SSRF guard that blocks the image optimizer from
    // fetching loopback/private IPs (localhost, 127.0.0.1, ::1, 10/8, ...).
    // Production keeps this guard ON — MinIO/S3 images come from public
    // hostnames behind a CDN. In dev we fetch from localhost:9000 (MinIO),
    // so we open the gate here only for dev.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },

  // Tighten security headers across all responses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
