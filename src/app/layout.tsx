import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LocalAI — Khám phá sản phẩm AI Việt Nam",
  description:
    "Nền tảng khám phá và giới thiệu sản phẩm AI do người Việt xây dựng. Tìm kiếm, ủng hộ, và kết nối với cộng đồng AI Việt Nam.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "LocalAI — Khám phá sản phẩm AI Việt Nam",
    description:
      "Nền tảng khám phá và giới thiệu sản phẩm AI do người Việt xây dựng.",
    siteName: "LocalAI",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LocalAI — Khám phá sản phẩm AI Việt Nam",
    description:
      "Nền tảng khám phá và giới thiệu sản phẩm AI do người Việt xây dựng.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className={figtree.variable}>
      <body className="min-h-screen bg-[var(--color-bg)] font-sans text-[var(--color-text)] antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
