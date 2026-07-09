"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export interface AccountFormData {
  product_id: number;
  distributor_id: number | null;
  login_username: string;
  login_password: string;
  cost_price: number;
  status: "available" | "sold" | "hidden";
  note: string;
}

export async function createAccountAction(data: AccountFormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    if (!data.product_id || !data.login_username || !data.login_password) {
      return { error: "Vui lòng nhập đủ các trường bắt buộc" };
    }

    await pool.query(
      `INSERT INTO accounts (
        product_id, distributor_id, login_username, login_password, 
        cost_price, status, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.product_id, data.distributor_id || null, data.login_username, data.login_password,
        data.cost_price || 0, data.status || "available", data.note || ""
      ]
    );

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Create account error:", error);
    return { error: "Lỗi hệ thống: " + (error.message || "Unknown error") };
  }
}

export async function updateAccountAction(id: number, data: AccountFormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    if (!data.product_id || !data.login_username || !data.login_password) {
      return { error: "Vui lòng nhập đủ các trường bắt buộc" };
    }

    await pool.query(
      `UPDATE accounts SET 
        product_id=?, distributor_id=?, login_username=?, login_password=?, 
        cost_price=?, status=?, note=?
      WHERE id=?`,
      [
        data.product_id, data.distributor_id || null, data.login_username, data.login_password,
        data.cost_price || 0, data.status || "available", data.note || "", id
      ]
    );

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Update account error:", error);
    return { error: "Lỗi hệ thống: " + (error.message || "Unknown error") };
  }
}

export async function deleteAccountAction(id: number) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return { error: "Unauthorized" };

    await pool.query("DELETE FROM accounts WHERE id = ?", [id]);

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete account error:", error);
    return { error: "Lỗi hệ thống" };
  }
}
