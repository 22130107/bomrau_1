"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";

export async function getProductImages(productId: number): Promise<string[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order, id",
    [productId]
  );
  return rows.map((r) => r.image_url);
}

export async function setProductImages(productId: number, imageUrls: string[]) {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Unauthorized" };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM product_images WHERE product_id = ?", [productId]);
    for (let i = 0; i < imageUrls.length; i++) {
      if (imageUrls[i]) {
        await conn.query(
          "INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)",
          [productId, imageUrls[i], i]
        );
      }
    }
    // Update main image_url to the first image
    await conn.query(
      "UPDATE products SET image_url = ? WHERE id = ?",
      [imageUrls[0] || "", productId]
    );
    await conn.commit();
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    await conn.rollback();
    return { error: "Lỗi cập nhật ảnh: " + (error.message || "Unknown error") };
  } finally {
    conn.release();
  }
}
