"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchPetAction, PetSearchResult } from "@/app/actions/search";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PetSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastTouch = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (Date.now() - lastTouch < 500) return;
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastTouch = Date.now();
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (value.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchPetAction(value);
      setResults(data);
      setIsOpen(data.length > 0);
      setLoading(false);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className="w-[185px] md:w-auto md:flex-1 md:max-w-[300px] relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Tìm pet, sàn, chưởng..."
          className="w-full px-3 py-1.5 md:px-4 md:py-2 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[12px] md:text-[14px] outline-none focus:border-[rgb(251,191,36)] transition-colors placeholder:text-[rgba(238,238,238,0.4)]"
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

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-xl overflow-hidden z-[9999] shadow-xl animate-fade-in">
          {results.map(r => {
            const typeLabel = r.type === "pet" ? "Pet" : r.type === "san" ? "Sàn" : "Chưởng";
            const typeColor = r.type === "pet" ? "text-[rgb(168,85,247)]" : r.type === "san" ? "text-[rgb(59,130,246)]" : "text-[rgb(251,191,36)]";
            const typeBorder = r.type === "pet" ? "border-[rgb(168,85,247)]" : r.type === "san" ? "border-[rgb(59,130,246)]" : "border-[rgb(251,191,36)]";
            const typeBg = r.type === "pet" ? "bg-[rgba(168,85,247,0.1)]" : r.type === "san" ? "bg-[rgba(59,130,246,0.1)]" : "bg-[rgba(251,191,36,0.1)]";
            return (
              <Link
                key={r.name}
                href={`/search?q=${encodeURIComponent(r.name)}`}
                onClick={() => { setIsOpen(false); setQuery(""); }}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-[rgb(31,41,55)] transition-colors border-b border-[rgba(255,255,255,0.05)] last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-[13px] font-semibold truncate">{r.name}</p>
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${typeColor} ${typeBorder} ${typeBg} border`}>{typeLabel}</span>
                  </div>
                  <p className="text-[rgba(238,238,238,0.5)] text-[11px]">{r.count} sản phẩm</p>
                </div>
              </Link>
            );
          })}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => { setIsOpen(false); }}
            className="flex items-center justify-center px-3 py-2 bg-[rgb(31,41,55)] hover:bg-[rgb(55,65,81)] text-[rgb(251,191,36)] text-[12px] font-semibold transition-colors"
          >
            Xem tất cả kết quả →
          </Link>
        </div>
      )}
    </div>
  );
}
