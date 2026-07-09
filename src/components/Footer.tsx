"use client";

import Link from "next/link";
import { LogoSwitcher } from "./LogoSwitcher";
import { useSiteInfo } from "./SiteInfo";

export function Footer() {
  const info = useSiteInfo();

  return (
    <footer className="bg-[rgba(15,23,42,0.6)] pt-10 md:pt-20">
      <div className="mx-auto w-full max-w-[1200px] px-[14px]">
        <div className="mx-auto relative w-[180px] md:w-[260px] mb-[24px]">
          <Link href="/" className="block">
            <LogoSwitcher width={260} height={80} className="block w-full" loading="lazy" />
          </Link>
        </div>
        <p className="font-medium text-center text-[14px] md:text-[16px]">{info.tagline}</p>
        <div className="mt-[16px]">
          <ul className="items-center flex justify-center gap-[12px]">
            <li className="list-none">
              <a href="https://www.facebook.com/profile.php" target="_blank" rel="noopener noreferrer" className="items-center flex justify-center w-10 h-10 bg-[rgb(220,38,38)] text-white rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </li>
            <li className="list-none">
              <a href="https://www.tiktok.com/@caythifc" target="_blank" rel="noopener noreferrer" className="items-center flex justify-center w-10 h-10 bg-[rgb(220,38,38)] text-white rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11V9.4a6.33 6.33 0 00-.82-.05A6.34 6.34 0 003.15 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.42a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.85z"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>
        <div className="border-t mt-[32px] border-[rgb(238,238,238)] pt-6 pb-6">
          <p className="font-medium text-center text-[12px] md:text-[16px]">{info.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
