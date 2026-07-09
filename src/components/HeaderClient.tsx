"use client";

import { useState } from "react";
import Link from "next/link";


interface HeaderClientProps {
  isLoggedIn: boolean;
  username?: string;
  role?: "admin" | "npp" | "user";
  dashboardHref: string | null; // /admin hoặc /npp, null nếu là user thường
}

const DASHBOARD_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  admin: {
    label: "Quản trị",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
      </svg>
    ),
  },
  npp: {
    label: "Doanh thu",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
      </svg>
    ),
  },
};

export function HeaderClient({ isLoggedIn, username, role, dashboardHref }: HeaderClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dashboard = role && dashboardHref ? DASHBOARD_LABEL[role] : null;

  return (
    <>
      <div className="flex items-center gap-2 justify-end flex-1 md:contents">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col justify-center items-center gap-[5px] w-8 h-8 md:hidden outline-none cursor-pointer shrink-0"
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-[2px] bg-[rgb(251,191,36)] rounded transition-all duration-300 ${isOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`w-6 h-[2px] bg-[rgb(251,191,36)] rounded transition-all duration-300 ${isOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-[2px] bg-[rgb(251,191,36)] rounded transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* ── Desktop Nav ────────────────────────────────────────────────── */}
      <div className="hidden md:block shrink-0">
        <nav>
          <ul className="flex gap-[8px] md:gap-[12px] justify-center items-center">

            <li className="font-medium list-none text-[14px] md:text-[17px]">
              <Link href="/category" className="items-center inline-flex gap-[4px] md:gap-[6px] px-1 md:px-2 py-1 hover:text-[rgb(251,191,36)] transition-colors">
                <i className="fa-solid fa-cart-arrow-down" />
                <span>Shopping</span>
              </Link>
            </li>

            <li className="font-medium list-none text-[14px] md:text-[17px]">
              <Link href="/random" className="items-center inline-flex gap-[4px] md:gap-[6px] px-1 md:px-2 py-1 hover:text-[rgb(251,191,36)] transition-colors">
                <i className="fa-solid fa-dice" />
                <span>TÚI MÙ</span>
              </Link>
            </li>

            {/* Username → Profile */}
            <li className="font-medium list-none">
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 md:px-4 py-1 bg-[rgb(31,41,55)] hover:bg-[rgb(55,65,81)] border border-[rgb(251,191,36)] text-[rgb(251,191,36)] font-bold text-[12px] md:text-[14px] rounded-lg transition-colors"
                  aria-label="Tài khoản của tôi"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                  {username}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-3 md:px-4 py-1 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] text-black font-bold text-[12px] md:text-[14px] rounded-lg transition-colors"
                >
                  Đăng Nhập
                </Link>
              )}
            </li>

          </ul>
        </nav>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed top-[60px] left-0 right-0 md:hidden border-t border-[rgba(254,226,226,0.15)] bg-[rgb(15,23,42)] px-[14px] py-4 animate-fade-in z-[2505]">
          <nav className="flex flex-col gap-3">

            <Link href="/news" className="flex items-center gap-2 text-[16px] font-medium text-white hover:text-[rgb(251,191,36)] transition-colors py-2 border-b border-[rgba(255,255,255,0.05)]" onClick={() => setIsOpen(false)}>
              <i className="fa-solid fa-bell" />
              <span>Thông Báo</span>
            </Link>

            <Link href="/category" className="flex items-center gap-2 text-[16px] font-medium text-white hover:text-[rgb(251,191,36)] transition-colors py-2 border-b border-[rgba(255,255,255,0.05)]" onClick={() => setIsOpen(false)}>
              <i className="fa-solid fa-cart-arrow-down" />
              <span>Shopping</span>
            </Link>

            <Link href="/random" className="flex items-center gap-2 text-[16px] font-medium text-white hover:text-[rgb(251,191,36)] transition-colors py-2 border-b border-[rgba(255,255,255,0.05)]" onClick={() => setIsOpen(false)}>
              <i className="fa-solid fa-dice" />
              <span>TÚI MÙ</span>
            </Link>

            <div className="pt-1">
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[rgb(31,41,55)] border border-[rgb(251,191,36)] text-[rgb(251,191,36)] font-bold text-[14px] rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                  Tài khoản của tôi
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center w-full py-2.5 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] text-black font-bold text-[14px] rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Đăng Nhập
                </Link>
              )}
            </div>

          </nav>
        </div>
      )}
    </>
  );
}
