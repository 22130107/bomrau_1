"use client";

import { useState, useEffect, useRef } from "react";
import { ProductCard } from "./ProductCard";

interface ProductItem {
  id: number;
  name: string;
  image_url: string;
  price: number;
  originalPrice: number;
  discount: number;
  sold?: number;
  remaining?: number;
}

interface CategorySearchProps {
  slug: string;
  categoryName: string;
  initialProducts: ProductItem[];
  initialTotalPages: number;
  initialTotal: number;
}

export function CategorySearch({
  slug,
  categoryName,
  initialProducts,
  initialTotalPages,
  initialTotal,
}: CategorySearchProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchProducts = async (q: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(p));
      const res = await fetch(`/api/category/${slug}/search?${params}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      // keep current
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(value, 1);
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchProducts(query, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset when slug changes
  useEffect(() => {
    setQuery("");
    setPage(1);
    setProducts(initialProducts);
    setTotalPages(initialTotalPages);
    setTotal(initialTotal);
  }, [slug, initialProducts, initialTotalPages, initialTotal]);

  return (
    <div className="pt-6 md:pt-10 pb-6 md:pb-10">
      <div className="mx-auto w-full max-w-[1200px] px-[14px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-[16px] md:mb-[32px]">
          <h1 className="font-bold border-[rgb(251,191,36)] text-[rgb(251,191,36)] text-[28px] md:text-[36px] leading-[48px] md:leading-[64px] pl-4 md:pl-6 border-l-[4px]">
            {categoryName}
          </h1>
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm pet, sàn, chưởng..."
              className="flex-1 md:w-64 px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] placeholder:text-[rgba(238,238,238,0.3)]"
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
            {query
              ? `Không tìm thấy sản phẩm phù hợp với "${query}".`
              : "Hiện chưa có sản phẩm nào trong danh mục này."}
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
                  sold={product.sold}
                  remaining={product.remaining}
                  href={`/category/${slug}/detail.html?id=${product.id}`}
                />
              ))}
            </ul>
            <div className="flex items-center justify-center gap-4 mt-6">
              {query && (
                <button
                  onClick={() => handleSearch("")}
                  className="px-4 py-2 bg-[rgb(75,85,99)] hover:bg-[rgb(107,114,128)] text-white text-[14px] rounded-lg transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center justify-center min-w-[36px] h-[36px] px-2 text-[14px] rounded-lg transition-colors bg-[rgba(255,255,255,0.08)] text-[rgba(238,238,238,0.8)] hover:bg-[rgba(255,255,255,0.15)] disabled:bg-[rgba(255,255,255,0.04)] disabled:text-[rgba(238,238,238,0.3)] disabled:pointer-events-none"
                  >
                    ‹
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number | "..." = i + 1;
                    if (totalPages > 7) {
                      const start = Math.max(2, page - 1);
                      const end = Math.min(totalPages - 1, page + 1);
                      if (i === 0) pageNum = 1;
                      else if (i === 6) pageNum = totalPages;
                      else if (i < start - 1) pageNum = "...";
                      else if (i > end) pageNum = "...";
                      else pageNum = start + (i - (start - 2 > 1 ? 1 : 2));
                    }
                    return pageNum === "..." ? (
                      <span key={`e${i}`} className="flex items-center justify-center min-w-[36px] h-[36px] text-[rgba(238,238,238,0.5)]">...</span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex items-center justify-center min-w-[36px] h-[36px] px-2 text-[14px] rounded-lg transition-colors ${
                          pageNum === page
                            ? "bg-[rgb(202,138,4)] text-black font-bold"
                            : "bg-[rgba(255,255,255,0.08)] text-[rgba(238,238,238,0.8)] hover:bg-[rgba(255,255,255,0.15)]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center justify-center min-w-[36px] h-[36px] px-2 text-[14px] rounded-lg transition-colors bg-[rgba(255,255,255,0.08)] text-[rgba(238,238,238,0.8)] hover:bg-[rgba(255,255,255,0.15)] disabled:bg-[rgba(255,255,255,0.04)] disabled:text-[rgba(238,238,238,0.3)] disabled:pointer-events-none"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
