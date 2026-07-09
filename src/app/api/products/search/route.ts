import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

const ITEMS_PER_PAGE = 12;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const whereClauses: string[] = ["p.status = 'available'"];
    const queryValues: any[] = [];

    if (q) {
      whereClauses.push("(p.title LIKE ? OR p.pet_tim LIKE ? OR p.san_tim LIKE ? OR p.chuong LIKE ? OR p.extra_info LIKE ?)");
      const like = `%${q}%`;
      queryValues.push(like, like, like, like, like);
    }

    const whereSQL = whereClauses.join(" AND ");

    const [countResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM products p WHERE ${whereSQL}`, queryValues
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const [products] = await pool.query<RowDataPacket[]>(`
      SELECT p.id, p.title as name, p.image_url, p.original_price as originalPrice,
             p.price, p.discount_percent as discount
      FROM products p
      WHERE ${whereSQL}
      ORDER BY p.is_pinned DESC, p.price ASC
      LIMIT ? OFFSET ?
    `, [...queryValues, ITEMS_PER_PAGE, offset]);

    return NextResponse.json({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        image_url: p.image_url || p.category_image || "",
        price: Number(p.price),
        originalPrice: Number(p.originalPrice),
        discount: Number(p.discount),
      })),
      totalPages,
      total,
    });
  } catch (error: any) {
    console.error("Products search API error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
