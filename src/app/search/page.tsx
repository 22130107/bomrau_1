import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const metadata: Metadata = {
  title: "Tìm kiếm - Shop TFT",
  description: "Kết quả tìm kiếm sản phẩm TFT.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim() || "";

  let products: RowDataPacket[] = [];

  if (q) {
    const like = `%${q}%`;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT p.id, p.title as name, p.image_url, p.original_price as originalPrice,
              p.price, p.discount_percent as discount,
              p.fake_sold_count as sold, p.fake_remaining_count as remaining,
              (SELECT COUNT(*) FROM accounts WHERE product_id = p.id AND status = 'sold') as real_sold,
              (SELECT COUNT(*) FROM accounts WHERE product_id = p.id AND status = 'available') as real_remaining,
              c.slug as category_slug, c.image_url as category_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'available'
          AND (p.pet_tim LIKE ? OR p.san_tim LIKE ? OR p.chuong LIKE ?)
       ORDER BY p.id DESC
       LIMIT 50`,
      [like, like, like]
    );
    products = rows;
  }

  return (
    <div>
      <main>
        <Breadcrumb items={[
          { label: "Trang chủ", href: "/", icon: "home" },
          { label: q ? `Kết quả cho "${q}"` : "Tìm kiếm" },
        ]} />
        <div className="pt-6 md:pt-10 pb-6 md:pb-10">
          <div className="mx-auto w-full max-w-[1200px] px-[14px]">
            <h1 className="font-bold mb-[16px] md:mb-[32px] border-[rgb(251,191,36)] text-[rgb(251,191,36)] text-[28px] md:text-[36px] leading-[48px] md:leading-[64px] pl-4 md:pl-6 border-l-[4px]">
              {q ? `Kết quả cho "${q}"` : "Tìm kiếm sản phẩm"}
            </h1>
            {!q ? (
              <p className="text-[rgba(238,238,238,0.6)] text-[16px] italic">Vui lòng nhập từ khóa để tìm kiếm.</p>
            ) : products.length === 0 ? (
              <p className="text-[rgba(238,238,238,0.6)] text-[16px] italic">Không tìm thấy sản phẩm nào phù hợp.</p>
            ) : (
              <>
                <p className="text-[rgba(238,238,238,0.5)] text-[13px] mb-4">Tìm thấy {products.length} sản phẩm</p>
                <ul className="flex flex-wrap mt-[32px] md:mt-[64px] gap-[16px] md:gap-[32px] animate-fade-in-up">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id.toString()}
                      name={product.name}
                      price={Number(product.price)}
                      originalPrice={Number(product.originalPrice)}
                      discount={Number(product.discount)}
                      image={product.image_url || product.category_image || ""}
                      sold={Number(product.sold) || Number(product.real_sold) || undefined}
                      remaining={Number(product.remaining) || Number(product.real_remaining) || undefined}
                      href={`/category/${product.category_slug}/detail.html?id=${product.id}`}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
