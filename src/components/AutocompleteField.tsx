"use client";

import { useState, useRef, useEffect } from "react";
export interface ProductOption {
  id: number;
  name: string;
}

interface AutocompleteFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  optionType: "pet_tim" | "san_tim" | "chuong";
}

export function AutocompleteField({ label, value, onChange, placeholder, optionType }: AutocompleteFieldProps) {
  const tags = value ? value.split(",").map(s => s.trim()).filter(Boolean) : [];
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<ProductOption[]>([]);
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

  const updateTags = (newTags: string[]) => {
    onChange(newTags.filter(Boolean).join(","));
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    updateTags([...tags, trimmed]);
    setInputValue("");
    setIsOpen(false);
  };

  const removeTag = (index: number) => {
    updateTags(tags.filter((_, i) => i !== index));
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (text.trim().length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/options?type=${optionType}&q=${encodeURIComponent(text)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setIsOpen(data.length > 0);
        }
      } catch (err) {
        setSuggestions([]);
      }
      setLoading(false);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div ref={wrapperRef} className="flex flex-col gap-1 relative md:col-span-3">
      <label className="text-[12px] text-[rgba(238,238,238,0.6)]">{label}</label>
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg focus-within:border-[rgb(251,191,36)] min-h-[40px]">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-[rgb(55,65,81)] text-white text-[12px] rounded-full border border-[rgb(75,85,99)]">
            {tag}
            <button onClick={() => removeTag(i)} className="text-[rgba(238,238,238,0.5)] hover:text-white text-[14px] leading-none cursor-pointer">&times;</button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[80px] bg-transparent text-white text-[14px] outline-none border-none p-0"
        />
        {loading && (
          <svg className="animate-spin h-4 w-4 text-[rgb(251,191,36)] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-xl overflow-hidden z-[9999] shadow-xl">
          {suggestions.filter(s => !tags.includes(s.name)).map(s => (
            <button
              key={s.id}
              onClick={() => addTag(s.name)}
              className="w-full text-left px-3 py-2 text-white text-[13px] hover:bg-[rgb(31,41,55)] transition-colors border-b border-[rgba(255,255,255,0.05)] last:border-b-0 cursor-pointer"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
