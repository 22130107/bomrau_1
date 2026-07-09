import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Đăng Nhập - Shop TFT",
  description: "Đăng nhập hoặc đăng ký tài khoản Shop TFT để mua nick game TFT.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <LoginForm />
      </main>
    </div>
  );
}
