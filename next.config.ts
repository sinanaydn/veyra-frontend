import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React strict mode — surface side-effect bugs early
  reactStrictMode: true,

  // Image optimization — whitelist backend storage hosts
  // Backend CarImage.url likely points to S3-style storage; expand as needed.
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
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
