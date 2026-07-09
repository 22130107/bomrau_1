import type { MetadataRoute } from "next";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bomrautft.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/category`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE_URL}/random`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  const [categories] = await pool.query<RowDataPacket[]>(
    "SELECT slug, updated_at FROM categories WHERE is_active = 1"
  );
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: cat.updated_at || new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const [products] = await pool.query<RowDataPacket[]>(
    "SELECT p.id, c.slug FROM products p JOIN categories c ON c.id = p.category_id WHERE p.status = 'available' AND c.is_active = 1"
  );
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/category/${p.slug}/detail.html?id=${p.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
