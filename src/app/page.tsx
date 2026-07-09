import type { Metadata } from "next";
import { NewsSection } from "@/components/NewsSection";
import { CategorySection } from "@/components/CategorySection";

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
        <CategorySection />
      </main>
    </div>
  );
}
