import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true,
  // Prevent Next.js from issuing automatic 308 redirects to add trailing slashes.
  // This stops the redirect loop: Next.js 308 → Django 301 → Next.js 308 → …
  // The trailing slash is already enforced by the API client and Django's APPEND_SLASH.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/media/:path*",
        destination: `${apiBase}/media/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/city/:slug/",
        destination: "/hostels-in-:slug/",
        permanent: true,
      },
      {
        source: "/city/:slug",
        destination: "/hostels-in-:slug/",
        permanent: true,
      },
    ];
  },

  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "34.80.15.95",
        port: "",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;