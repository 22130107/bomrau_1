import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

function autoExtraCategories(price: number, manual: number[] = []): number[] {
  const auto = price > 2999000 ? 1 : 2;
  const set = new Set(manual);
  set.add(auto);
  return Array.from(set);
}

async function setProductImages(productId: number, imageUrls: string[]) {
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
    await conn.query(
      "UPDATE products SET image_url = ? WHERE id = ?",
      [imageUrls[0] || "", productId]
    );
    await conn.commit();
  } catch (error: any) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.title || data.price == null) {
      return NextResponse.json({ error: "Vui lòng nhập đủ các trường bắt buộc" }, { status: 400 });
    }

    const fakeSold = data.fake_sold_count || 0;
    const fakeRemaining = data.fake_remaining_count || 0;
    const catId = data.category_id || 1;

    const [result] = await pool.query(
      `INSERT INTO products (
        category_id, extra_categories, title, image_url, price, original_price, discount_percent, 
        fake_sold_count, fake_remaining_count, status, is_pinned, pet_tim, san_tim, chuong, extra_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        catId, JSON.stringify(autoExtraCategories(data.price, data.extra_categories)), data.title, data.image_url || "", data.price, data.original_price || 0,
        Math.max(0, Math.min(255, data.discount_percent || 0)), fakeSold, fakeRemaining,
        data.status || "available", data.is_pinned ? 1 : 0, data.pet_tim || null, data.san_tim || null, data.chuong || null, data.extra_info || null
      ]
    );

    const productId = (result as any).insertId;

    if (data.images && data.images.length > 0) {
      await setProductImages(productId, data.images);
    } else if (data.image_url) {
      await setProductImages(productId, [data.image_url]);
    }

    if (data.account_username && data.account_password) {
      await pool.query(
        `INSERT INTO accounts (product_id, distributor_id, login_username, login_password, cost_price, status, note)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productId, null, data.account_username, data.account_password,
          data.account_cost_price || 0, "available", data.account_note || ""
        ]
      );
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi hệ thống: " + (error.message || "Unknown error") }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id || !data.title || data.price == null) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const catId = data.category_id || 1;
    const id = data.id;

    await pool.query(
      `UPDATE products SET 
        category_id=?, extra_categories=?, title=?, image_url=?, price=?, original_price=?, 
        discount_percent=?, fake_sold_count=?, fake_remaining_count=?, status=?, is_pinned=?,
        pet_tim=?, san_tim=?, chuong=?, extra_info=?
      WHERE id=?`,
      [
        catId, JSON.stringify(autoExtraCategories(data.price, data.extra_categories)), data.title, data.image_url || "", data.price, data.original_price || 0,
        Math.max(0, Math.min(255, data.discount_percent || 0)), data.fake_sold_count || 0, data.fake_remaining_count || 0,
        data.status || "available", data.is_pinned ? 1 : 0, data.pet_tim || null, data.san_tim || null, data.chuong || null, data.extra_info || null, id
      ]
    );

    if (data.images && data.images.length > 0) {
      await setProductImages(id, data.images);
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi hệ thống: " + (error.message || "Unknown error") }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const ids = data.ids;
    if (!ids || ids.length === 0) return NextResponse.json({ error: "Chưa chọn sản phẩm" }, { status: 400 });

    const placeholders = ids.map(() => "?").join(",");
    await pool.query(`DELETE FROM products WHERE id IN (${placeholders})`, ids);

    revalidatePath("/admin");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi hệ thống: " + (error.message || "Unknown error") }, { status: 500 });
  }
}
