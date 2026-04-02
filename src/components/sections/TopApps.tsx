"use client";

import { useState, useEffect } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useTranslations } from "@/lib/i18n";
import { motion } from "framer-motion";
import { GlowingEffect } from "../ui/glowing-effect";
import { GLOW_DEFAULTS } from "../ui/glow-defaults";
import { getTopApps, getTrendingApps } from "@/lib/firestore";
import type { AppDetail } from "@/lib/app-data";
import Link from "next/link";

function AppList({ items }: { items: AppDetail[] }) {
  return items.map((app) => (
    <Link key={app.slug} href={`/app/${app.slug}`}>
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative flex cursor-pointer items-center gap-4 rounded-xl px-2 py-3.5 shadow-sm"
      >
        <GlowingEffect {...GLOW_DEFAULTS} />
        <img
          className="h-11 w-11 shrink-0 rounded-xl object-cover"
          src={
            app.icon ||
            `https://placehold.co/60x60/eee/white?text=${app.name.charAt(0)}`
          }
          alt={app.name}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{app.name}</p>
          <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">
            {app.tagline}
          </p>
        </div>
      </motion.div>
    </Link>
  ));
}

export function TopApps() {
  const topApps = useTranslations("home").topApps;
  const [leftApps, setLeftApps] = useState<AppDetail[]>([]);
  const [rightApps, setRightApps] = useState<AppDetail[]>([]);

  useEffect(() => {
    getTopApps(5).then(setLeftApps);
    getTrendingApps(5).then(setRightApps);
  }, []);

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
            <div className="h-full rounded-3xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                {topApps.left.eyebrow}
              </p>
              <h3 className="mt-1 text-xl font-bold">{topApps.left.title}</h3>
              <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                {topApps.left.description}
              </p>
              <div className="mt-4 flex gap-2 flex-col">
                <AppList items={leftApps} />
              </div>
            </div>
          </ScrollReveal>

          {/* Right card — Vietnam's favourites */}
          <ScrollReveal delay={0.1}>
            <div className="h-full rounded-3xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                {topApps.right.eyebrow}
              </p>
              <h3 className="mt-1 text-xl font-bold">{topApps.right.title}</h3>
              <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                {topApps.right.description}
              </p>
              <div className="mt-4">
                <AppList items={rightApps} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
