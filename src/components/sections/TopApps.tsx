"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useTranslations } from "@/lib/i18n";
import { motion } from "framer-motion";

interface AppItem {
  name: string;
  desc: string;
  color: string;
  photoURL?: string;
}

function AppList({
  items,
  onItemClick,
}: {
  items: AppItem[];
  onItemClick?: (item: AppItem) => void;
}) {
  return items.map((app) => (
    <motion.div
      key={app.name}
      whileHover={{
        y: -2,
        scale: 1.01,
        boxShadow: "0 0 24px rgba(0,0,0,0.12)",
      }}
      whileTap={{ scale: 0.99 }}
      className="flex cursor-pointer items-center gap-4 rounded-xl px-2 py-3.5 transition-colors hover:bg-[var(--color-text)]/[0.04]"
      onClick={() => onItemClick?.(app)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onItemClick?.(app);
        }
      }}
    >
      <img
        className="h-11 w-11 shrink-0 rounded-xl object-cover"
        src={app.photoURL || "https://placehold.co/60x60/eee/white"}
        alt={app.name}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">{app.name}</p>
        <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">
          {app.desc}
        </p>
      </div>
    </motion.div>
  ))

}

export function TopApps() {
  const topApps = useTranslations("home").topApps;
  const handleCardClick = (item: AppItem) => {
    // Replace with navigation when URLs are available
    console.log("App card clicked:", item.name);
  };

  return (
    <section id="top-apps" className="section-padding">
      <div className="container-main">
        <ScrollReveal>
          <h2 className="mb-8 text-section-title font-bold tracking-tight">
            {topApps.title}
          </h2>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left card — Top apps this week */}
          <ScrollReveal delay={0}>
            <div className="glass-card h-full rounded-3xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                {topApps.left.eyebrow}
              </p>
              <h3 className="mt-1 text-xl font-bold">{topApps.left.title}</h3>
              <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                {topApps.left.description}
              </p>
              <div className="mt-4">
                <AppList
                  items={topApps.left.items}
                  onItemClick={handleCardClick}
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Right card — Vietnam's favourites */}
          <ScrollReveal delay={0.1}>
            <div className="glass-card h-full rounded-3xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                {topApps.right.eyebrow}
              </p>
              <h3 className="mt-1 text-xl font-bold">
                {topApps.right.title}
              </h3>
              <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                {topApps.right.description}
              </p>
              <div className="mt-4">
                <AppList
                  items={topApps.right.items}
                  onItemClick={handleCardClick}
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
