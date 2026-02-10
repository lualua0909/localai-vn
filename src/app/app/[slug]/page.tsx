import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppBySlug } from "@/lib/app-data";
import { ProductView } from "@/components/app/ProductView";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const app = getAppBySlug(params.slug);

  if (!app) {
    return {
      title: "App Not Found"
    };
  }

  return {
    title: `${app.name} | Unikorn`,
    description: app.tagline,
    openGraph: {
      title: app.name,
      description: app.tagline,
      images: [app.icon]
    }
  };
}

export default function ProductPage({ params }: PageProps) {
  const app = getAppBySlug(params.slug);

  if (!app) {
    notFound();
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
