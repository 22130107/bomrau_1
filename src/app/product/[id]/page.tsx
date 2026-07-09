import type { Metadata } from "next";
import { ProductDetail } from "@/components/ProductDetail";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [products] = await pool.query<RowDataPacket[]>("SELECT id, title, image_url FROM products WHERE id = ? AND status = 'available'", [id]);
  if (products.length === 0) return {};
  const product = products[0];
  const image = product.image_url || "";
  return {
    title: `${product.title} - Shop TFT`,
    description: `Mua tài khoản game TFT ${product.title} giá rẻ, uy tín.`,
    openGraph: {
      title: `${product.title} - Shop TFT`,
      description: `Mua tài khoản game TFT ${product.title} giá rẻ.`,
      images: image ? [{ url: image }] : [],
    },
    alternates: { canonical: `/product/${id}` },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [products] = await pool.query<RowDataPacket[]>(`
    SELECT p.id, p.title, p.image_url, p.price, p.original_price, p.discount_percent,
           p.pet_tim, p.san_tim, p.chuong, p.extra_info, p.category_id,
           c.name as category_name, c.slug as category_slug, c.image_url as category_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.status = 'available'
  `, [id]);

  if (products.length === 0) {
    notFound();
  }
  const product = products[0];

  const [imageRows] = await pool.query<RowDataPacket[]>(
    "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order, id",
    [id]
  );
  const productImages: string[] = imageRows.length > 0
    ? (imageRows as RowDataPacket[]).map((r) => r.image_url as string)
    : (product.image_url ? [product.image_url] : []);

  const [accounts] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM accounts WHERE product_id = ? AND status = 'available'",
    [id]
  );
  const realRemainingCount = accounts[0].count;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.image_url || product.category_image || "",
    description: `Mua tài khoản game TFT ${product.title} giá rẻ, uy tín tại Shop TFT.`,
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "VND",
      availability: realRemainingCount > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/product/${id}`,
    },
    category: product.category_name || "",
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <main>
        <div className="pt-6 md:pt-10 pb-10">
          <ProductDetail
            productId={Number(id)}
            name={product.title}
            image={product.image_url || product.category_image || ""}
            images={productImages}
            price={Number(product.price)}
            originalPrice={Number(product.original_price)}
            discount={Number(product.discount_percent)}
            petTim={product.pet_tim || undefined}
            sanTim={product.san_tim || undefined}
            chuong={product.chuong || undefined}
            extraInfo={product.extra_info || undefined}
            isOutOfStock={realRemainingCount === 0}
          />
        </div>
      </main>
    </div>
  );
}
