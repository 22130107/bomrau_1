import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategorySearch } from "@/components/CategorySearch";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { notFound } from "next/navigation";

const ITEMS_PER_PAGE = 12;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [categories] = await pool.query<RowDataPacket[]>("SELECT id, name FROM categories WHERE slug = ?", [slug]);
  if (categories.length === 0) return {};
  const category = categories[0];
  return {
    title: `${category.name} - Shop TFT | Mua Nick TFT Giá Rẻ, Uy Tín`,
    description: `Mua tài khoản game TFT danh mục ${category.name} giá rẻ, uy tín. Acc VIP, Pet Tím, Thần Thoại. Giao dịch nhanh chóng, an toàn.`,
    openGraph: {
      title: `${category.name} - Shop TFT`,
      description: `Mua tài khoản game TFT danh mục ${category.name} giá rẻ, uy tín.`,
    },
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [categories] = await pool.query<RowDataPacket[]>("SELECT id, name, image_url FROM categories WHERE slug = ?", [slug]);

  if (categories.length === 0) {
    notFound();
  }

  const category = categories[0];

  const [countResult] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as total FROM products p WHERE p.status = 'available' AND (p.category_id = ? OR JSON_CONTAINS(p.extra_categories, CAST(? AS JSON)))",
    [category.id, category.id]
  );
  const total = countResult[0].total;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const [products] = await pool.query<RowDataPacket[]>(`
    SELECT p.id, p.title as name, p.image_url, p.original_price as originalPrice, p.price, p.discount_percent as discount,
           p.fake_sold_count as sold, p.fake_remaining_count as remaining,
           (SELECT COUNT(*) FROM accounts WHERE product_id = p.id AND status = 'sold') as real_sold,
           (SELECT COUNT(*) FROM accounts WHERE product_id = p.id AND status = 'available') as real_remaining
    FROM products p
    WHERE p.status = 'available' AND (p.category_id = ? OR JSON_CONTAINS(p.extra_categories, CAST(? AS JSON)))
    ORDER BY p.is_pinned DESC, p.price ASC
    LIMIT ? OFFSET 0
  `, [category.id, category.id, ITEMS_PER_PAGE]);

  const initialProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    image_url: p.image_url || category.image_url || "",
    price: Number(p.price),
    originalPrice: Number(p.originalPrice),
    discount: Number(p.discount),
    sold: Number(p.sold) || Number(p.real_sold) || undefined,
    remaining: Number(p.remaining) || Number(p.real_remaining) || undefined,
  }));

  return (
    <div>
      <main>
        <Breadcrumb items={[
          { label: "Trang chủ", href: "/", icon: "home" },
          { label: "Danh mục", href: "/#danhmuc" },
          { label: category.name },
        ]} />
        <CategorySearch
          slug={slug}
          categoryName={category.name}
          initialProducts={initialProducts}
          initialTotalPages={totalPages}
          initialTotal={total}
        />
      </main>
    </div>
  );
}
