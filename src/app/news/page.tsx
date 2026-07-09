import type { Metadata } from "next";
import { NewsSection } from "@/components/NewsSection";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const metadata: Metadata = {
  title: "Thông Báo - Shop TFT",
  description: "Tin tức, khuyến mãi mới nhất từ Shop TFT.",
};

export default async function ThongBaoPage() {
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

  return (
    <div>
      <main>
        <NewsSection notifications={initialNotifications} />
      </main>
    </div>
  );
}
