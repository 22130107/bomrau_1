import type { Metadata, Viewport } from "next";
import { Open_Sans, Nunito } from "next/font/google";
import "./globals.css";
import { ContactButton } from "@/components/ContactButton";


const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin", "vietnamese"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: { default: "Shop TFT - Mua Bán Nick Game TFT", template: "%s - Shop TFT" },
  description: "Shop TFT chuyên cung cấp tài khoản game TFT giá rẻ.",
  keywords: "mua nick tft, shop tft, nick game tft, tài khoản tft giá rẻ",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Shop TFT - Mua Bán Nick Game TFT",
    description: "Shop TFT uy tín, giá rẻ, đa dạng, đầy đủ Mobile và PC.",
    type: "website",
    url: "/",
    siteName: "Shop TFT",
    images: [{ url: "/icon.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop TFT - Mua Bán Nick Game TFT",
    description: "Shop TFT uy tín, giá rẻ, đa dạng, đầy đủ Mobile và PC.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${openSans.variable} ${nunito.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://storage.googleapis.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://storage.googleapis.com" />
      </head>
      <body className="min-h-screen bg-[rgb(15,23,42)] text-[rgb(238,238,238)] font-[family-name:var(--font-open-sans)]">
        {children}
        <ContactButton />
      </body>
    </html>
  );
}
