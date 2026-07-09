import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductDetail } from "@/components/ProductDetail";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ id?: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { id } = await searchParams;
  if (!id) return {};
  const [categories] = await pool.query<RowDataPacket[]>("SELECT id, name FROM categories WHERE slug = ?", [slug]);
  const [products] = await pool.query<RowDataPacket[]>("SELECT id, title, image_url FROM products WHERE id = ? AND status = 'available'", [id]);
  if (products.length === 0 || categories.length === 0) return {};
  const product = products[0];
  const category = categories[0];
  const image = product.image_url || "";
  return {
    title: `${product.title} - Shop TFT | Mua Nick TFT Giá Rẻ`,
    description: `Mua tài khoản game TFT ${product.title} giá rẻ, uy tín. Danh mục ${category.name}. Giao dịch nhanh chóng, an toàn.`,
    openGraph: {
      title: `${product.title} - Shop TFT`,
      description: `Mua tài khoản game TFT ${product.title} giá rẻ.`,
      images: image ? [{ url: image }] : [],
    },
    alternates: { canonical: `/category/${slug}/detail.html?id=${id}` },
  };
}

export default async function ProductDetailPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>, 
  searchParams: Promise<{ id?: string }> 
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const slug = resolvedParams.slug;
  const productId = resolvedSearchParams.id;

  if (!productId) {
    notFound();
  }

  // Lấy thông tin Category
  const [categories] = await pool.query<RowDataPacket[]>("SELECT id, name, image_url FROM categories WHERE slug = ?", [slug]);
  if (categories.length === 0) {
    notFound();
  }
  const category = categories[0];

  // Lấy thông tin Product
  const [products] = await pool.query<RowDataPacket[]>(`
    SELECT id, title, image_url, price, original_price, discount_percent, fake_sold_count, fake_remaining_count, pet_tim, san_tim, chuong, extra_info
    FROM products 
    WHERE id = ? AND status = 'available'
  `, [productId]);

  if (products.length === 0) {
    notFound();
  }
  const product = products[0];

  // Lấy nhiều ảnh sản phẩm
  const [imageRows] = await pool.query<RowDataPacket[]>(
    "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order, id",
    [productId]
  );
  const productImages: string[] = imageRows.length > 0
    ? (imageRows as RowDataPacket[]).map((r) => r.image_url as string)
    : (product.image_url ? [product.image_url] : []);

  // Lấy số lượng Acc thực tế còn trong kho
  const [accounts] = await pool.query<RowDataPacket[]>(`
    SELECT COUNT(*) as count FROM accounts WHERE product_id = ? AND status = 'available'
  `, [productId]);
  const realRemainingCount = accounts[0].count;

  // Lấy session và thông tin người dùng hiện tại
  const session = await getSession();
  let currentUser = null;
  if (session) {
    const [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, username, balance FROM users WHERE id = ? LIMIT 1",
      [session.userId]
    );
    if (userRows.length > 0) {
      currentUser = {
        id: userRows[0].id,
        username: userRows[0].username,
        balance: Number(userRows[0].balance),
      };
    }
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.image_url || category.image_url || "",
    description: `Mua tài khoản game TFT ${product.title} giá rẻ, uy tín tại Shop TFT.`,
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "VND",
      availability: realRemainingCount > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/category/${slug}/detail.html?id=${productId}`,
    },
    category: category.name,
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <main>
        <Breadcrumb items={[
          { label: "Trang chủ", href: "/", icon: "home" },
          { label: category.name, href: `/category/${slug}` },
          { label: product.title },
        ]} />
        <div className="pt-6 md:pt-10 pb-10">
          <ProductDetail 
            productId={Number(productId)}
            currentUser={currentUser}
            name={product.title}
            image={product.image_url || category.image_url}
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
