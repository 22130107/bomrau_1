"use server";

import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";

export async function adminLogin(username: string, password: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, username, password_hash FROM users WHERE username = ? AND role = 'admin' AND is_active = 1 LIMIT 1",
      [username]
    );

    if (rows.length === 0) return { error: "Sai tên đăng nhập hoặc mật khẩu" };

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return { error: "Sai tên đăng nhập hoặc mật khẩu" };

    await createSession(user.id, user.username, "admin");
    return { success: true };
  } catch {
    return { error: "Lỗi hệ thống" };
  }
}

export async function adminLogout() {
  await deleteSession();
}
