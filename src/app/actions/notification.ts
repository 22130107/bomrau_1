"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";

export async function createNotificationAction(data: { title: string; content: string; image_url?: string; is_pinned: boolean }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    if (!data.title || !data.content) {
      return { error: "Vui lòng nhập tiêu đề và nội dung thông báo" };
    }

    await pool.query(
      "INSERT INTO notifications (title, content, image_url, type, is_pinned, is_active) VALUES (?, ?, ?, 'news', ?, 1)",
      [data.title, data.content, data.image_url || null, data.is_pinned ? 1 : 0]
    );

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Create notification error:", error);
    return { error: "Lỗi hệ thống: " + (error.message || "Unknown error") };
  }
}

export async function updateNotificationAction(id: number, data: { title: string; content: string; image_url?: string; is_pinned: boolean; is_active: boolean }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    if (!data.title || !data.content) {
      return { error: "Vui lòng nhập tiêu đề và nội dung thông báo" };
    }

    await pool.query(
      "UPDATE notifications SET title = ?, content = ?, image_url = ?, is_pinned = ?, is_active = ? WHERE id = ?",
      [data.title, data.content, data.image_url || null, data.is_pinned ? 1 : 0, data.is_active ? 1 : 0, id]
    );

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Update notification error:", error);
    return { error: "Lỗi hệ thống: " + (error.message || "Unknown error") };
  }
}

export async function deleteNotificationAction(id: number) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    await pool.query("DELETE FROM notifications WHERE id = ?", [id]);

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Delete notification error:", error);
    return { error: "Lỗi hệ thống: " + (error.message || "Unknown error") };
  }
}
