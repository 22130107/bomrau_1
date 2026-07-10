import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const id = data.id;

    if (!id) return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });

    await pool.query(
      "UPDATE products SET is_pinned = NOT is_pinned WHERE id = ?",
      [id]
    );

    revalidatePath("/admin");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
