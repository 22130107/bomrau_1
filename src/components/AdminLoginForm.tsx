"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/actions/admin-auth";

export function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await adminLogin(username, password);
    setLoading(false);
    if (res.error) setError(res.error);
    else router.push("/admin");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[400px] mx-auto">
      <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-6 md:p-8">
        <h1 className="text-[rgb(251,191,36)] text-[24px] font-bold text-center mb-6">Đăng nhập Admin</h1>
        {error && (
          <div className="mb-4 px-4 py-3 bg-[rgba(220,38,38,0.15)] border border-[rgb(220,38,38)] rounded-lg text-[rgb(220,38,38)] text-[13px]">{error}</div>
        )}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[14px] text-[rgba(238,238,238,0.7)]">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[14px] text-[rgba(238,238,238,0.7)]">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] disabled:opacity-60 text-black font-bold text-[16px] rounded-lg transition-colors"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </form>
  );
}
