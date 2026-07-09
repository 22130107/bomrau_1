"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";
import { getSession } from "@/lib/session";

export interface ProductOption {
  id: number;
  name: string;
}

export interface ProductOptionFull extends ProductOption {
  type: string;
  sort_order: number;
}

export async function getProductOptions(type: string): Promise<ProductOption[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, name FROM product_attribute_options WHERE type = ? AND is_active = 1 ORDER BY sort_order ASC, name ASC",
      [type]
    );
    return rows as ProductOption[];
  } catch (error) {
    console.error("getProductOptions error:", error);
    return [];
  }
}

export async function getAllProductOptions(): Promise<ProductOptionFull[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, type, name, sort_order FROM product_attribute_options WHERE is_active = 1 ORDER BY type, sort_order ASC, name ASC"
    );
    return rows as ProductOptionFull[];
  } catch (error) {
    console.error("getAllProductOptions error:", error);
    return [];
  }
}

export async function searchProductOptions(type: string, query: string): Promise<ProductOption[]> {
  try {
    if (!query || query.trim().length < 1) return [];

    const q = `%${query.trim()}%`;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name FROM product_attribute_options
       WHERE type = ? AND is_active = 1 AND name LIKE ?
       ORDER BY
         CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
         sort_order ASC, name ASC
       LIMIT 10`,
      [type, q, `${query.trim()}%`]
    );
    return rows as ProductOption[];
  } catch (error) {
    console.error("searchProductOptions error:", error);
    return [];
  }
}

export async function createProductOption(type: string, name: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    if (!type || !name?.trim()) return { error: "Vui lòng nhập đủ thông tin" };

    await pool.query(
      "INSERT INTO product_attribute_options (type, name, sort_order) VALUES (?, ?, 0)",
      [type, name.trim()]
    );

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("createProductOption error:", error);
    return { error: "Lỗi hệ thống: " + (error.message || "Unknown error") };
  }
}

export async function updateProductOption(id: number, name: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    if (!name?.trim()) return { error: "Tên không được để trống" };

    await pool.query(
      "UPDATE product_attribute_options SET name = ? WHERE id = ?",
      [name.trim(), id]
    );

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("updateProductOption error:", error);
    return { error: "Lỗi hệ thống: " + (error.message || "Unknown error") };
  }
}

export async function deleteProductOption(id: number) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    await pool.query("UPDATE product_attribute_options SET is_active = 0 WHERE id = ?", [id]);

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("deleteProductOption error:", error);
    return { error: "Lỗi hệ thống" };
  }
}
