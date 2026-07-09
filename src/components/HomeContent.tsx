"use client";

import { useState, useRef } from "react";
import { ProductCard } from "./ProductCard";

interface ProductItem {
  id: number;
  name: string;
  image_url: string;
  price: number;
  originalPrice: number;
  discount: number;
}

interface HomeContentProps {
  initialProducts: ProductItem[];
}

export function HomeContent({ initialProducts }: HomeContentProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchProducts = async (q: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", "1");
      const res = await fetch(`/api/products/search?${params}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch {
      // keep current
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(value);
    }, 300);
  };

  return (
    <section className="pt-6 md:pt-10 pb-6 md:pb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
      <div className="mx-auto w-full max-w-[1200px] px-[14px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-[16px] md:mb-[32px]">
          <h2 className="font-bold border-[rgb(251,191,36)] text-[rgb(251,191,36)] text-[28px] md:text-[36px] leading-[48px] md:leading-[64px] pl-4 md:pl-6 border-l-[4px]">
            Sản Phẩm
          </h2>
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm pet, sàn, chưởng..."
              className="flex-1 md:w-80 px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] placeholder:text-[rgba(238,238,238,0.3)]"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-4 w-4 text-[rgb(251,191,36)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
        {products.length === 0 ? (
          <p className="text-[rgba(238,238,238,0.6)] text-[16px] italic">
            {searched
              ? `Không tìm thấy sản phẩm phù hợp với "${query}".`
              : "Hiện chưa có sản phẩm nào."}
          </p>
        ) : (
          <>
            <ul className="flex flex-wrap mt-[32px] md:mt-[64px] gap-[16px] md:gap-[32px] animate-fade-in-up">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id.toString()}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  image={product.image_url}
                  href={`/product/${product.id}`}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
