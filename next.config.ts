import type { NextConfig } from "next";

const allowedOrigins = ["bomrautft.com", "hungnho.com"];
if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()).filter(Boolean);
  allowedOrigins.push(...envOrigins);
}

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins,
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
};

export default nextConfig;
