import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  slug: string;
  q?: string;
}

export function Pagination({ currentPage, totalPages, slug, q }: PaginationProps) {
  const query = q ? `&q=${encodeURIComponent(q)}` : "";
  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btnClass = "flex items-center justify-center min-w-[36px] h-[36px] px-2 text-[14px] rounded-lg transition-colors";
  const activeClass = "bg-[rgb(202,138,4)] text-black font-bold";
  const inactiveClass = "bg-[rgba(255,255,255,0.08)] text-[rgba(238,238,238,0.8)] hover:bg-[rgba(255,255,255,0.15)]";
  const disabledClass = "bg-[rgba(255,255,255,0.04)] text-[rgba(238,238,238,0.3)] pointer-events-none";
  const ellipsisClass = "flex items-center justify-center min-w-[36px] h-[36px] text-[rgba(238,238,238,0.5)]";

  return (
    <nav className="flex items-center justify-center gap-2 mt-8 md:mt-12" aria-label="Phân trang">
      <Link
        href={`/category/${slug}?page=${currentPage - 1}${query}`}
        className={`${btnClass} ${currentPage === 1 ? disabledClass : inactiveClass}`}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
      >
        ‹
      </Link>
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className={ellipsisClass}>...</span>
        ) : (
          <Link
            key={page}
            href={`/category/${slug}?page=${page}${query}`}
            className={`${btnClass} ${page === currentPage ? activeClass : inactiveClass}`}
          >
            {page}
          </Link>
        )
      )}
      <Link
        href={`/category/${slug}?page=${currentPage + 1}${query}`}
        className={`${btnClass} ${currentPage === totalPages ? disabledClass : inactiveClass}`}
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : undefined}
      >
        ›
      </Link>
    </nav>
  );
}
