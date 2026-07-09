import type { Metadata } from "next";
import { NewsSection } from "@/components/NewsSection";
import { HomeContent } from "@/components/HomeContent";

import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const metadata: Metadata = {
  title: "Shop TFT - Mua Bán Nick Game TFT",
  description: "Shop TFT chuyên cung cấp tài khoản game TFT giá rẻ.",
};

export default async function HomePage() {
  const [notifications] = await pool.query<RowDataPacket[]>(`
    SELECT title, content, image_url 
    FROM notifications 
    WHERE is_active = 1 
    ORDER BY is_pinned DESC, id DESC
  `);

  const initialNotifications = notifications.map(row => ({
    title: row.title,
    content: row.content,
    image: row.image_url || "",
  }));

  const [products] = await pool.query<RowDataPacket[]>(`
    SELECT p.id, p.title as name, p.image_url, p.original_price as originalPrice,
           p.price, p.discount_percent as discount
    FROM products p
    WHERE p.status = 'available'
    ORDER BY p.is_pinned DESC, p.price ASC
  `);

  const initialProducts = products.map(p => ({
    id: p.id as number,
    name: p.name as string,
    image_url: (p.image_url || "") as string,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice),
    discount: Number(p.discount),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Shop TFT",
        url: "/",
        description: "Shop mua bán nick game TFT uy tín, giá rẻ.",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: "/search?q={search_term_string}" },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: "Shop TFT",
        url: "/",
        logo: "/icon.png",
      },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <NewsSection notifications={initialNotifications} />
        <HomeContent initialProducts={initialProducts} />
      </main>
    </div>
  );
}
