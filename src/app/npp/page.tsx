import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DistributorContent } from "@/components/DistributorContent";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Nhà Phân Phối - Shop TFT",
  description: "Trang quản lý doanh thu dành cho nhà phân phối của Shop TFT.",
  robots: "noindex, nofollow",
};

export default async function NppPage() {
  const session = await getSession();
  if (!session || session.role !== "npp") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-6 md:py-10 px-4">
        <DistributorContent />
      </main>
    </div>
  );
}
