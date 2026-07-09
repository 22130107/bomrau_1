import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminContent, AdminProduct } from "@/components/AdminContent";
import { getSession } from "@/lib/session";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";


export const metadata: Metadata = {
  title: "Quản Trị - Shop TFT",
  description: "Trang quản trị hệ thống Shop TFT. Quản lý sản phẩm, danh mục, tài khoản, đơn hàng và người dùng.",
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  // 1. Fetch Products
  const [productRows] = await pool.query<RowDataPacket[]>(`
    SELECT p.id, p.category_id, p.extra_categories, p.title, p.image_url, 
           p.price, p.original_price, p.discount_percent, p.fake_sold_count, p.fake_remaining_count, p.status, p.is_pinned,
           p.pet_tim, p.san_tim, p.chuong, p.extra_info,
           c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.is_pinned DESC, p.id DESC
  `);

  function parseExtraCategories(val: any): number[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(Number);
    try { return JSON.parse(val).map(Number); } catch { return []; }
  }

  const productIds = productRows.map(row => row.id);
  let imagesMap = new Map<number, string[]>();
  if (productIds.length > 0) {
    const placeholders = productIds.map(() => "?").join(",");
    const [imageRows] = await pool.query<RowDataPacket[]>(
      `SELECT product_id, image_url FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order, id`,
      productIds
    );
    for (const row of imageRows) {
      const existing = imagesMap.get(row.product_id) || [];
      existing.push(row.image_url);
      imagesMap.set(row.product_id, existing);
    }
  }

  const initialProducts: AdminProduct[] = productRows.map(row => ({
    id: row.id,
    category_id: row.category_id,
    extra_categories: parseExtraCategories(row.extra_categories),
    title: row.title,
    image_url: row.image_url || "",
    images: imagesMap.get(row.id) || (row.image_url ? [row.image_url] : []),
    original_price: Number(row.original_price) || 0,
    price: Number(row.price),
    discount_percent: Number(row.discount_percent) || 0,
    fake_sold_count: Number(row.fake_sold_count) || 0,
    fake_remaining_count: Number(row.fake_remaining_count) || 0,
    status: row.status as "available" | "hidden",
    is_pinned: Boolean(row.is_pinned),
    pet_tim: row.pet_tim || "",
    san_tim: row.san_tim || "",
    chuong: row.chuong || "",
    extra_info: row.extra_info || ""
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-end gap-4 px-4 py-3 border-b border-[rgb(75,85,99)]">
        <span className="text-[13px] text-[rgba(238,238,238,0.5)]">Xin chào, {session.username}</span>
        <Link href="/api/auth/logout" className="text-[13px] text-[rgb(220,38,38)] hover:text-[rgb(248,113,113)] transition-colors">Đăng xuất</Link>
      </header>
      <main className="flex-1 py-6 md:py-10 px-4">
        <AdminContent 
          initialProducts={initialProducts}
        />
      </main>
    </div>
  );
}
