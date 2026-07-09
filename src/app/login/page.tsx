import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập Admin - Shop TFT",
  robots: "noindex, nofollow",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin");

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <AdminLoginForm />
    </main>
  );
}
