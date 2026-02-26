"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAppBySlug } from "@/lib/firestore";
import type { AppDetail } from "@/lib/app-data";
import { ProductView } from "@/components/app/ProductView";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppBySlug(slug)
      .then(setApp)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </main>
        <Footer />
      </>
    );
  }

  if (!app) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">App Not Found</h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              The app you are looking for does not exist.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--color-bg)]">
        <ProductView app={app} />
      </main>
      <Footer />
    </>
  );
}
