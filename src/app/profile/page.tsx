import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/ProfileContent";
import { getSession } from "@/lib/session";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const metadata: Metadata = {
  title: "Tài khoản của tôi - Shop TFT",
  description: "Quản lý tài khoản tại Shop TFT.",
};

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  display_name: string;
  email: string | null;
  role: "admin" | "npp" | "user";
  avatar_url: string | null;
  created_at: string;
}

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [userRows] = await pool.query<UserRow[]>(
    `SELECT id, username, COALESCE(display_name, username) AS display_name, email, role, avatar_url, created_at
     FROM users WHERE id = ? LIMIT 1`,
    [session.userId]
  );
  const user = userRows[0];
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-6 md:py-10 px-4">
        <ProfileContent
          user={{
            id: user.id,
            username: user.username,
            displayName: user.display_name,
            email: user.email || "Chưa cập nhật",
            role: user.role,
            avatarUrl: user.avatar_url,
            joinDate: new Date(user.created_at).toLocaleDateString("vi-VN"),
          }}
        />
      </main>
    </div>
  );
}
