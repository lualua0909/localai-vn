"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { useTranslations } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Search, Star, ChevronRight } from "lucide-react";

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
  "https://assets.aceternity.com/world-map.webp",
];

type AppItem = {
  name: string;
  desc: string;
  category: string;
  rating: string;
  reviews: string;
};

function AppRow({
  app,
  rank,
  buttonLabel,
}: {
  app: AppItem;
  rank: number;
  buttonLabel: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-text)]/[0.03]"
    >
      <span className="w-5 text-center text-[15px] font-bold text-[var(--color-text-secondary)]">
        {rank}
      </span>
      <img
        className="h-12 w-12 shrink-0 rounded-xl object-cover"
        src="https://placehold.co/60x60/eee/white"
        alt={app.name}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">{app.name}</p>
        <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-secondary)]">
          {app.desc}
        </p>
      </div>
      <button className="shrink-0 rounded-full bg-[var(--color-text)]/10 px-4 py-1 text-[13px] font-semibold text-accent">
        {buttonLabel}
      </button>
    </motion.div>
  );
}

function AppCard({
  app,
  buttonLabel,
}: {
  app: AppItem;
  buttonLabel: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 0 24px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.99 }}
      className="glass-card flex cursor-pointer items-start gap-3 rounded-2xl p-4"
    >
      <img
        className="h-14 w-14 shrink-0 rounded-xl object-cover"
        src="https://placehold.co/60x60/eee/white"
        alt={app.name}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">{app.name}</p>
        <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
          {app.category}
        </p>
        <div className="mt-1.5 flex items-center gap-1">
          <Star size={10} className="text-amber-500" />
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            {app.rating} ({app.reviews})
          </span>
        </div>
      </div>
      <button className="shrink-0 rounded-full bg-[var(--color-text)]/10 px-3 py-1 text-[12px] font-semibold text-accent">
        {buttonLabel}
      </button>
    </motion.div>
  );
}

export default function ExplorePage() {
  const t = useTranslations("explore");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredApps = t.apps.filter((app) => {
    const matchCategory = !activeCategory || app.category === activeCategory;
    const matchSearch =
      !search ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.desc.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      <Header />
      <main className="min-h-screen pt-12 pb-10">
        {/* 3D Marquee Hero */}
        <div className="relative">
          <ThreeDMarquee
            images={marqueeImages}
            className="h-[400px] max-[640px]:h-[320px]"
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-3 max-w-md text-base text-[var(--color-text-secondary)]">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="container-main">
          {/* Search */}
          <div className="relative my-8">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="focus-ring w-full rounded-xl border border-[var(--color-border)] bg-transparent py-3 pl-11 pr-4 text-sm outline-none transition-all hover:border-black/20 dark:hover:border-white/20 placeholder:text-[var(--color-text-secondary)]/50"
            />
          </div>

          {/* Top Free + Top Paid */}
          <div className="mb-10 grid gap-6 lg:grid-cols-2">
            {/* Top Free */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{t.topFree.title}</h2>
                <button className="flex items-center gap-0.5 text-sm font-medium text-accent">
                  {t.topFree.seeAll}
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="glass-card divide-y divide-[var(--color-border)] rounded-2xl">
                {t.apps.slice(0, 5).map((app, idx) => (
                  <AppRow
                    key={app.name}
                    app={app}
                    rank={idx + 1}
                    buttonLabel={t.getButton}
                  />
                ))}
              </div>
            </div>

            {/* Top Paid */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{t.topPaid.title}</h2>
                <button className="flex items-center gap-0.5 text-sm font-medium text-accent">
                  {t.topPaid.seeAll}
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="glass-card divide-y divide-[var(--color-border)] rounded-2xl">
                {t.apps.slice(5, 10).map((app, idx) => (
                  <AppRow
                    key={app.name}
                    app={app}
                    rank={idx + 1}
                    buttonLabel={t.getButton}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Discover section */}
          <div className="mb-10">
            <h2 className="mb-4 text-lg font-bold">{t.discover.title}</h2>

            {/* Category pills */}
            <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${!activeCategory
                  ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                  : "bg-[var(--color-text)]/5 text-[var(--color-text-secondary)] hover:bg-[var(--color-text)]/10"
                  }`}
              >
                {t.filterAll}
              </button>
              {t.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat ? null : cat)
                  }
                  className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${activeCategory === cat
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
              {filteredApps.map((app) => (
                <AppCard
                  key={app.name}
                  app={app}
                  buttonLabel={t.getButton}
                />
              ))}
            </div>

            {filteredApps.length === 0 && (
              <p className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                {t.noResults}
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
