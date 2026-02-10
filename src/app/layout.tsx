import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Providers } from "@/components/Providers";
import viMeta from "@/i18n/vi/meta.json";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: viMeta.title,
  description: viMeta.description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: viMeta.ogTitle,
    description: viMeta.ogDescription,
    siteName: "LocalAI",
    locale: viMeta.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: viMeta.title,
    description: viMeta.description,
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
