"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";

export async function createCategoryAction(data: { name: string; slug: string; description: string; image_url: string; sort_order: number; fake_remaining_count?: number; fake_sold_count?: number }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    if (!data.name || !data.slug) return { error: "Vui lòng nhập tên và slug" };

    const [existing] = await pool.query<RowDataPacket[]>("SELECT id FROM categories WHERE slug = ?", [data.slug]);
    if (existing.length > 0) return { error: "Slug đã tồn tại" };

    await pool.query(
      "INSERT INTO categories (name, slug, description, image_url, sort_order, fake_remaining_count, fake_sold_count) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [data.name, data.slug, data.description || "", data.image_url || "", data.sort_order || 0, data.fake_remaining_count || 0, data.fake_sold_count || 0]
    );

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Create category error:", error);
    return { error: "Lỗi hệ thống" };
  }
}

export async function updateCategoryAction(id: number, data: { name: string; slug: string; description: string; image_url: string; sort_order: number; fake_remaining_count?: number; fake_sold_count?: number }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    if (!data.name || !data.slug) return { error: "Vui lòng nhập tên và slug" };

    const [existing] = await pool.query<RowDataPacket[]>("SELECT id FROM categories WHERE slug = ? AND id != ?", [data.slug, id]);
    if (existing.length > 0) return { error: "Slug đã tồn tại cho danh mục khác" };

    await pool.query(
      "UPDATE categories SET name=?, slug=?, description=?, image_url=?, sort_order=?, fake_remaining_count=?, fake_sold_count=? WHERE id=?",
      [data.name, data.slug, data.description || "", data.image_url || "", data.sort_order || 0, data.fake_remaining_count || 0, data.fake_sold_count || 0, id]
    );

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Update category error:", error);
    return { error: "Lỗi hệ thống" };
  }
}

export async function toggleCategoryActiveAction(id: number) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    await pool.query(
      "UPDATE categories SET is_active = NOT is_active WHERE id = ?",
      [id]
    );

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Toggle category active error:", error);
    return { error: "Lỗi hệ thống" };
  }
}

export async function deleteCategoryAction(id: number) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    const [products] = await pool.query<RowDataPacket[]>("SELECT id FROM products WHERE category_id = ? LIMIT 1", [id]);
    if (products.length > 0) return { error: "Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển hoặc xóa sản phẩm trước." };

    await pool.query("DELETE FROM categories WHERE id = ?", [id]);

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Delete category error:", error);
    return { error: "Lỗi hệ thống" };
  }
}
