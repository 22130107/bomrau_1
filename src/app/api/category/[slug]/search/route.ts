import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

const ITEMS_PER_PAGE = 12;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const [categories] = await pool.query<RowDataPacket[]>(
      "SELECT id, name, image_url FROM categories WHERE slug = ?", [slug]
    );
    if (categories.length === 0) {
      return NextResponse.json({ products: [], totalPages: 0, total: 0, categoryImage: "" });
    }

    const category = categories[0];

    const whereClauses: string[] = [
      "p.status = 'available'",
      "(p.category_id = ? OR JSON_CONTAINS(p.extra_categories, CAST(? AS JSON)))"
    ];
    const queryValues: any[] = [category.id, category.id];

    if (q) {
      whereClauses.push("(p.title LIKE ? OR p.pet_tim LIKE ? OR p.san_tim LIKE ? OR p.chuong LIKE ?)");
      const like = `%${q}%`;
      queryValues.push(like, like, like, like);
    }

    const whereSQL = whereClauses.join(" AND ");

    const [countResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM products p WHERE ${whereSQL}`, queryValues
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const [products] = await pool.query<RowDataPacket[]>(`
      SELECT p.id, p.title as name, p.image_url, p.original_price as originalPrice,
             p.price, p.discount_percent as discount,
             p.fake_sold_count as sold, p.fake_remaining_count as remaining,
             (SELECT COUNT(*) FROM accounts WHERE product_id = p.id AND status = 'sold') as real_sold,
             (SELECT COUNT(*) FROM accounts WHERE product_id = p.id AND status = 'available') as real_remaining
      FROM products p
      WHERE ${whereSQL}
      ORDER BY p.is_pinned DESC, p.price ASC
      LIMIT ? OFFSET ?
    `, [...queryValues, ITEMS_PER_PAGE, offset]);

    return NextResponse.json({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        image_url: p.image_url || category.image_url || "",
        price: Number(p.price),
        originalPrice: Number(p.originalPrice),
        discount: Number(p.discount),
        sold: Number(p.sold) || Number(p.real_sold) || undefined,
        remaining: Number(p.remaining) || Number(p.real_remaining) || undefined,
      })),
      totalPages,
      total,
      categoryImage: category.image_url || "",
    });
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
