import { CategoryCard } from "./CategoryCard";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function CategorySection() {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT c.name as title, c.slug, c.description as price, c.image_url as image,
           c.fake_remaining_count as remaining,
           c.fake_sold_count as sold
    FROM categories c
    WHERE c.is_spin_enabled = 0 AND c.is_active = 1
    ORDER BY c.sort_order ASC
  `);

  if (rows.length === 0) return null;

  return (
    <section id="danhmuc" className="pt-6 md:pt-10 pb-6 md:pb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
      <div className="mx-auto w-full max-w-[1200px] px-[14px]">
        <h2 className="font-bold mb-[16px] md:mb-[32px] border-[rgb(251,191,36)] text-[rgb(251,191,36)] text-[28px] md:text-[36px] leading-[48px] md:leading-[64px] pl-4 md:pl-6 border-l-[4px]">
          Danh Mục
        </h2>
        <ul className="flex flex-wrap mt-[32px] md:mt-[64px] gap-[16px] md:gap-[32px]">
          {rows.map((category, index) => (
            <CategoryCard
              key={index}
              image={category.image}
              alt={category.title}
              title={category.title}
              price={category.price}
              sold={Number(category.sold) || undefined}
              remaining={Number(category.remaining) || undefined}
              href={`/category/${category.slug}`}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
