"use client";

import { useState } from "react";

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      id="btn-logout"
      onClick={async () => {
        setIsPending(true);
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
      disabled={isPending}
      className="mt-4 w-full py-3 bg-[rgb(220,38,38)] hover:bg-[rgb(185,28,28)] disabled:opacity-60 text-white font-bold text-[16px] rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      {isPending ? (
        <>
          <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Đang đăng xuất...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
          Đăng Xuất
        </>
      )}
    </button>
  );
}
