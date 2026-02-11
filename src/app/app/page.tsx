"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useTranslations } from "@/lib/i18n";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useIsMobile";
import { parseReviews } from "@/util";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

const ThreeDMarquee = dynamic(
  () => import("@/components/ui/3d-marquee").then((m) => m.ThreeDMarquee),
  { ssr: false }
);

const marqueeImages = [
  "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
  "https://assets.aceternity.com/animated-modal.png",
  "https://assets.aceternity.com/animated-testimonials.webp",
  "https://assets.aceternity.com/cloudinary_bkp/Tooltip_luwy44.png",
  "https://assets.aceternity.com/github-globe.png",
  "https://assets.aceternity.com/glare-card.png",
  "https://assets.aceternity.com/layout-grid.png",
  "https://assets.aceternity.com/flip-text.png",
  "https://assets.aceternity.com/hero-highlight.png",
  "https://assets.aceternity.com/carousel.webp",
  "https://assets.aceternity.com/placeholders-and-vanish-input.png",
  "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
  "https://assets.aceternity.com/signup-form.png",
  "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
  "https://assets.aceternity.com/spotlight-new.webp",
  "https://assets.aceternity.com/cloudinary_bkp/Spotlight_ar5jpr.png",
  "https://assets.aceternity.com/cloudinary_bkp/Parallax_Scroll_pzlatw_anfkh7.png",
  "https://assets.aceternity.com/tabs.png",
  "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
  "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
  "https://assets.aceternity.com/glowing-effect.webp",
  "https://assets.aceternity.com/hover-border-gradient.png",
  "https://assets.aceternity.com/cloudinary_bkp/Infinite_Moving_Cards_evhzur.png",
  "https://assets.aceternity.com/cloudinary_bkp/Lamp_hlq3ln.png",
  "https://assets.aceternity.com/macbook-scroll.png",
  "https://assets.aceternity.com/cloudinary_bkp/Meteors_fye3ys.png",
  "https://assets.aceternity.com/cloudinary_bkp/Moving_Border_yn78lv.png",
  "https://assets.aceternity.com/multi-step-loader.png",
  "https://assets.aceternity.com/vortex.png",
  "https://assets.aceternity.com/wobble-card.png",
  "https://assets.aceternity.com/world-map.webp"
];

import { AppCard } from "@/components/app/AppCard";

type AppItem = {
  name: string;
  desc: string;
  category: string;
  rating: string;
  reviews: string;
};

function ExploreContent() {
  const t = useTranslations("explore");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sortBy, setSortBy] = useState<"newest" | "rating" | "interaction">(
    "newest"
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const placeholders = [
    "Search for AI chatbots...",
    "Find image generation tools...",
    "Discover education apps...",
    "Look for finance assistants...",
    "Explore creative tools..."
  ];

  const handleVanishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleVanishSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Optional: Log or specific action on submit
    console.log("submitted");
  };

  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 12;

  const filteredApps = t.apps
    .filter((app: AppItem) => {
      const matchCategory = !activeCategory || app.category === activeCategory;
      const matchSearch =
        !search ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.desc.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a: AppItem, b: AppItem) => {
      if (sortBy === "rating") {
        return parseFloat(b.rating) - parseFloat(a.rating);
      }
      if (sortBy === "interaction") {
        return parseReviews(b.reviews) - parseReviews(a.reviews);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    // Optional: Scroll to top of grid or page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (newSort: "newest" | "rating" | "interaction") => {
    setSortBy(newSort);
    handlePageChange(1);
  };

  const handleCategoryChange = (newCat: string | null) => {
    setActiveCategory(newCat);
    handlePageChange(1);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-12 pb-10">
        <div className="relative">
          {isMobile === false ? (
            <ThreeDMarquee
              images={marqueeImages}
              className="h-[400px] max-[640px]:h-[320px]"
            />
          ) : null}
        </div>

        <div className="container-main">
          <div className="relative my-8 flex justify-center">
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleVanishChange}
              onSubmit={handleVanishSubmit}
            />
          </div>

          <div className="mb-10">
            {/* Control Bar: Sort & Category Dropdown */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="appearance-none rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-2 pr-8 text-sm font-medium outline-none transition-colors hover:bg-[var(--color-text)]/5 focus:border-[var(--color-text)] cursor-pointer"
                >
                  <option value="newest">{t.sortOptions.newest}</option>
                  <option value="rating">{t.sortOptions.rating}</option>
                  <option value="interaction">
                    {t.sortOptions.interaction}
                  </option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative sm:hidden">
                <select
                  value={activeCategory || ""}
                  onChange={(e) => handleCategoryChange(e.target.value || null)}
                  className="appearance-none rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-2 pr-8 text-sm font-medium outline-none transition-colors hover:bg-[var(--color-text)]/5 focus:border-[var(--color-text)] cursor-pointer"
                >
                  <option value="">{t.filterAll}</option>
                  {t.categories.map((cat: string) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category pills */}
            <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  !activeCategory
                    ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                    : "bg-[var(--color-text)]/5 text-[var(--color-text-secondary)] hover:bg-[var(--color-text)]/10"
                }`}
              >
                {t.filterAll}
              </button>
              {t.categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() =>
                    handleCategoryChange(activeCategory === cat ? null : cat)
                  }
                  className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                      : "bg-[var(--color-text)]/5 text-[var(--color-text-secondary)] hover:bg-[var(--color-text)]/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* App grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {paginatedApps.map((app: AppItem) => (
                <AppCard key={app.name} app={app} />
              ))}
            </div>

            {paginatedApps.length === 0 && (
              <p className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                {t.noResults}
              </p>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--color-text)]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                            : "hover:bg-[var(--color-text)]/5 text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--color-text)]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ExplorePage() {
  return <ExploreContent />;
}
