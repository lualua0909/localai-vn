"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Spotlight } from "@/components/ui/Spotlight";
import { ArrowUpRight, Star, TrendingUp } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export function AstraStudio() {
  const studio = useTranslations("home").studio;

  return (
    <section id="featured" className="section-padding">
      <div className="container-main">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
            {studio.eyebrow}
          </p>
          <h2 className="text-section-title font-bold tracking-tight">
            {studio.title}
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            {studio.description}
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {studio.products.map((product, idx) => (
            <ScrollReveal key={product.name} delay={idx * 0.06}>
              <Spotlight className="h-full rounded-3xl">
                <div className="glass-card flex h-full flex-col rounded-3xl p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${product.color} flex items-center justify-center`}>
                        <span className="text-sm font-bold text-white">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{product.name}</h3>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-[var(--color-text-secondary)]" />
                  </div>

                  <p className="flex-1 text-sm text-[var(--color-text-secondary)]">
                    {product.desc}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-500" />
                      <span className="text-xs font-medium">{product.stars}</span>
                    </div>
                    {product.trending && (
                      <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5">
                        <TrendingUp size={10} className="text-emerald-500" />
                        <span className="text-[10px] font-medium text-emerald-500">
                          {studio.trending}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Spotlight>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
