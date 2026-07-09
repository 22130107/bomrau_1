import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/npp/", "/api/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bomrautft.com"}/sitemap.xml`,
  };
}
