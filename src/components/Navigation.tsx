"use client";

import Link from "next/link";

interface NavigationProps {
  isLoggedIn?: boolean;
  username?: string;
}

export function Navigation({ isLoggedIn, username }: NavigationProps) {
  return (
    <nav className="shrink-0 w-full md:w-auto">
      <ul className="flex gap-[8px] md:gap-[16px] justify-center md:justify-start flex-wrap items-center">
        <li className="font-medium list-none text-[14px] md:text-[18px]">
          <Link href="/news" className="items-center inline-flex relative gap-[4px] md:gap-[8px] px-1 md:px-2 py-1 hover:text-[rgb(251,191,36)] transition-colors">
            <i className="fa-solid fa-bell"></i>
            <span>Thông Báo</span>
          </Link>
        </li>
        <li className="font-medium list-none text-[14px] md:text-[18px]">
          <Link href="/category" className="items-center inline-flex relative gap-[4px] md:gap-[8px] px-1 md:px-2 py-1 hover:text-[rgb(251,191,36)] transition-colors">
            <i className="fa-solid fa-cart-arrow-down"></i>
            <span>Shopping</span>
          </Link>
        </li>
        <li className="font-medium list-none">
          {isLoggedIn ? (
            <Link href="/profile" className="flex items-center gap-2 px-3 md:px-4 py-1 bg-[rgb(31,41,55)] hover:bg-[rgb(55,65,81)] border border-[rgb(251,191,36)] text-[rgb(251,191,36)] font-bold text-[12px] md:text-[14px] rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
              {username}
            </Link>
          ) : (
            <Link href="/login" className="px-3 md:px-4 py-1 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] text-black font-bold text-[12px] md:text-[14px] rounded-lg transition-colors">
              Đăng Nhập
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
