"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface AppItem {
  name: string;
  desc: string;
  color: string;
  initial: string;
}

function AppList({ items, cta }: { items: AppItem[]; cta: string }) {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {items.map((app) => (
        <div
          key={app.name}
          className="flex items-center gap-4 py-3.5 transition-colors hover:bg-[var(--color-text)]/[0.02]"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${app.color}`}
          >
            <span className="text-sm font-bold text-white">{app.initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">{app.name}</p>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
              {app.desc}
            </p>
          </div>
          <button className="shrink-0 rounded-full bg-accent/10 px-3.5 py-1.5 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/20">
            {cta}
          </button>
        </div>
      ))}
    </div>
  );
}

export function TopApps() {
  const topApps = useTranslations("home").topApps;

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
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                {topApps.left.description}
              </p>
              <div className="mt-4">
                <AppList items={topApps.left.items} cta={topApps.button} />
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
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                {topApps.right.description}
              </p>
              <div className="mt-4">
                <AppList items={topApps.right.items} cta={topApps.button} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
