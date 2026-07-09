import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href || undefined,
    })),
  };

  return (
    <div className="pt-4 pb-2 md:pb-3">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="mx-auto w-full max-w-[1200px] px-[14px]">
        <ul className="flex flex-wrap items-center gap-y-1">
          {items.map((item, index) => (
            <li key={index} className="items-center inline-flex font-medium text-[rgba(238,238,238,0.7)] text-[14px] md:text-[18px] leading-[28px]">
              {item.href ? (
                <Link href={item.href} className="inline-flex items-center gap-1 text-[rgb(238,238,238)] hover:text-[rgb(251,191,36)] transition-colors">
                  {item.icon === "home" && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]">
                      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
                    </svg>
                  )}
                  {item.label}
                </Link>
              ) : (
                <span className="text-[rgba(238,238,238,0.5)]">{item.label}</span>
              )}
              {index < items.length - 1 && (
                <span className="mx-2 md:mx-3 text-[rgba(238,238,238,0.5)]">‣</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
