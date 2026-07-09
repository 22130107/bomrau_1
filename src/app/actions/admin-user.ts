"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";

export interface UserDetail {
  id: number;
  username: string;
  email: string | null;
  balance: number;
  role: string;
  is_active: boolean;
  joinDate: string;
  orders: UserOrder[];
}

export interface UserOrder {
  id: number;
  product: string;
  amount: number;
  status: string;
  date: string;
}

export async function toggleUserLockAction(id: number) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT is_active FROM users WHERE id = ?", [id]
    );
    if (rows.length === 0) return { error: "Không tìm thấy người dùng" };

    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [newStatus, id]);

    revalidatePath("/admin");
    return { success: true, newStatus: !!newStatus };
  } catch (error: any) {
    console.error("Toggle user lock error:", error);
    return { error: "Lỗi hệ thống: " + (error.message || "Unknown error") };
  }
}

export async function getUserDetailAction(id: number) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT id, username, email, balance, role, is_active, created_at FROM users WHERE id = ?",
      [id]
    );
    if (users.length === 0) return { error: "Không tìm thấy người dùng" };

    const user = users[0];

    const [orders] = await pool.query<RowDataPacket[]>(
      `SELECT o.id, p.title as product, o.amount, o.status, o.created_at
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT 50`,
      [id]
    );

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: Number(user.balance),
        role: user.role,
        is_active: Boolean(user.is_active),
        joinDate: new Date(user.created_at).toLocaleDateString("vi-VN"),
      },
      orders: orders.map((o: any) => ({
        id: o.id,
        product: o.product || "N/A",
        amount: Number(o.amount),
        status: o.status,
        date: new Date(o.created_at).toLocaleDateString("vi-VN"),
      })),
    };
  } catch (error: any) {
    console.error("Get user detail error:", error);
    return { error: "Lỗi hệ thống: " + (error.message || "Unknown error") };
  }
}
