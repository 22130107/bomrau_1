"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

interface UserData {
  id: number;
  username: string;
  displayName: string;
  email: string;
  role: "admin" | "npp" | "user";
  avatarUrl: string | null;
  joinDate: string;
}

interface ProfileContentProps {
  user: UserData;
}

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  admin: { label: "Quản trị viên", color: "bg-[rgb(220,38,38)] text-white" },
  npp: { label: "Nhà phân phối", color: "bg-[rgb(124,58,237)] text-white" },
  user: { label: "Thành viên", color: "bg-[rgb(31,41,55)] text-[rgb(251,191,36)] border border-[rgb(251,191,36)]" },
};

export function ProfileContent({ user }: ProfileContentProps) {
  const roleStyle = ROLE_LABEL[user.role] ?? ROLE_LABEL.user;

  return (
    <div className="w-full max-w-[800px] mx-auto animate-fade-in-up">
      {/* ── Profile Header ───────────────────────────────────────────────── */}
      <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-6 md:p-8 mb-6 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">

          {/* Avatar */}
          <div className="relative shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full object-cover border-2 border-[rgb(251,191,36)] shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              />
            ) : (
              <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full bg-gradient-to-br from-[rgb(202,138,4)] to-[rgb(251,191,36)] flex items-center justify-center text-[32px] md:text-[40px] font-bold text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 mb-1">
              <h2 className="text-[rgb(251,191,36)] text-[22px] md:text-[26px] font-bold">{user.displayName}</h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${roleStyle.color}`}>
                {roleStyle.label}
              </span>
            </div>
            <p className="text-[rgba(238,238,238,0.7)] text-[14px]">{user.email}</p>
            <p className="text-[rgba(238,238,238,0.5)] text-[12px] mt-1">Tham gia: {user.joinDate}</p>
          </div>
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-6 md:p-8">
        <div className="flex flex-col gap-3">
          <h3 className="text-[rgb(251,191,36)] text-[18px] md:text-[22px] font-bold mb-2">Thông tin tài khoản</h3>

          {[
            { label: "Tên hiển thị", value: user.displayName },
            { label: "Tên đăng nhập", value: user.username },
            { label: "Email", value: user.email },
            {
              label: "Loại tài khoản",
              value: (
                <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${roleStyle.color}`}>
                  {roleStyle.label}
                </span>
              ),
            },
            { label: "Ngày tham gia", value: user.joinDate },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={`flex justify-between items-center py-3 ${i < arr.length - 1 ? "border-b border-[rgb(75,85,99)]" : ""}`}
            >
              <span className="text-[rgba(238,238,238,0.7)] text-[14px]">{label}</span>
              <span className="text-white font-semibold text-[14px]">{value}</span>
            </div>
          ))}
          {/* Nút vào dashboard (chỉ admin/npp) */}
          {user.role !== "user" && (
            <Link
              href={user.role === "admin" ? "/admin" : "/npp"}
              className="mt-2 w-full py-3 flex items-center justify-center gap-2 bg-[rgba(124,58,237,0.15)] hover:bg-[rgba(124,58,237,0.3)] border border-[rgb(124,58,237)] text-[rgb(167,139,250)] font-bold text-[15px] rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
              </svg>
              {user.role === "admin" ? "Vào trang Quản trị" : "Vào trang Nhà phân phối"}
            </Link>
          )}

          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
