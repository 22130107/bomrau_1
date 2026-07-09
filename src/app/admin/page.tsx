import type { Metadata } from "next";
import { AdminContent, AdminProduct, AdminAccount, AdminCategory, AdminNotification } from "@/components/AdminContent";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";


export const metadata: Metadata = {
  title: "Quản Trị - Shop TFT",
  description: "Trang quản trị hệ thống Shop TFT. Quản lý sản phẩm, danh mục, tài khoản, đơn hàng và người dùng.",
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
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
    category_name: row.category_name || "N/A",
    status: row.status as "available" | "hidden",
    is_pinned: Boolean(row.is_pinned),
    pet_tim: row.pet_tim || "",
    san_tim: row.san_tim || "",
    chuong: row.chuong || "",
    extra_info: row.extra_info || ""
  }));

  // Fetch Accounts
  const [accountRows] = await pool.query<RowDataPacket[]>(`
    SELECT a.id, a.product_id, a.distributor_id, a.login_username, a.login_password, 
           a.cost_price, a.status, a.note,
           p.title as product_title, d.name as distributor_name
    FROM accounts a
    LEFT JOIN products p ON a.product_id = p.id
    LEFT JOIN distributors d ON a.distributor_id = d.id
    ORDER BY a.id DESC
  `);

  const initialAccounts: AdminAccount[] = accountRows.map(row => ({
    id: row.id,
    product_id: row.product_id,
    distributor_id: row.distributor_id || null,
    login_username: row.login_username,
    login_password: row.login_password,
    cost_price: Number(row.cost_price) || 0,
    status: row.status as "available" | "sold" | "hidden",
    note: row.note || "",
    product_title: row.product_title || "N/A",
    distributor_name: row.distributor_name || "N/A",
  }));

  // 2. Fetch Categories
  const [categoryRows] = await pool.query<RowDataPacket[]>(`
    SELECT c.id, c.name, c.slug, c.description, c.image_url, c.sort_order,
           c.fake_remaining_count as productCount,
           c.fake_sold_count as soldCount,
           c.is_active
    FROM categories c
    ORDER BY c.sort_order
  `);

  const initialCategories: AdminCategory[] = categoryRows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    image_url: row.image_url || "",
    sort_order: Number(row.sort_order) || 0,
    productCount: Number(row.productCount) || 0,
    soldCount: Number(row.soldCount) || 0,
    is_active: Boolean(row.is_active),
  }));

  // 3. Fetch Notifications
  const [notificationRows] = await pool.query<RowDataPacket[]>(`
    SELECT id, title, content, image_url, is_pinned, is_active, created_at
    FROM notifications
    ORDER BY id DESC
  `);

  const initialNotifications: AdminNotification[] = notificationRows.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    image_url: row.image_url || "",
    is_pinned: Boolean(row.is_pinned),
    is_active: Boolean(row.is_active),
    date: new Date(row.created_at).toLocaleDateString("vi-VN"),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-6 md:py-10 px-4">
        <AdminContent 
          initialProducts={initialProducts}
          initialAccounts={initialAccounts}
          initialCategories={initialCategories}
          initialNotifications={initialNotifications}
        />
      </main>
    </div>
  );
}
