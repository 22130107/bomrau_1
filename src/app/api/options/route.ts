import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const q = searchParams.get("q");

    if (type && q) {
      const query = `%${q.trim()}%`;
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT id, name FROM product_attribute_options
         WHERE type = ? AND is_active = 1 AND name LIKE ?
         ORDER BY
           CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
           sort_order ASC, name ASC
         LIMIT 10`,
        [type, query, `${q.trim()}%`]
      );
      return NextResponse.json(rows);
    } else if (type) {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT id, name FROM product_attribute_options WHERE type = ? AND is_active = 1 ORDER BY sort_order ASC, name ASC",
        [type]
      );
      return NextResponse.json(rows);
    } else {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT id, type, name, sort_order FROM product_attribute_options WHERE is_active = 1 ORDER BY type, sort_order ASC, name ASC"
      );
      return NextResponse.json(rows);
    }
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { type, name } = data;

    if (!type || !name?.trim()) return NextResponse.json({ error: "Vui lòng nhập đủ thông tin" }, { status: 400 });

    await pool.query(
      "INSERT INTO product_attribute_options (type, name, sort_order) VALUES (?, ?, 0)",
      [type, name.trim()]
    );

    revalidatePath("/admin");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { id, name } = data;

    if (!name?.trim() || !id) return NextResponse.json({ error: "Tên không hợp lệ" }, { status: 400 });

    await pool.query(
      "UPDATE product_attribute_options SET name = ? WHERE id = ?",
      [name.trim(), id]
    );

    revalidatePath("/admin");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { id } = data;

    await pool.query("UPDATE product_attribute_options SET is_active = 0 WHERE id = ?", [id]);

    revalidatePath("/admin");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
