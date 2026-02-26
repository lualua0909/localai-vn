"use client";

import { useState, useEffect } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ArrowUpRight, Star, TrendingUp } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { motion } from "framer-motion";
import { GlowingEffect } from "../ui/glowing-effect";
import { getApps } from "@/lib/firestore";
import type { AppDetail } from "@/lib/app-data";
import Link from "next/link";

export function AstraStudio() {
  const studio = useTranslations("home").studio;
  const [products, setProducts] = useState<AppDetail[]>([]);

  useEffect(() => {
    getApps().then((apps) => setProducts(apps.slice(0, 8)));
  }, []);

  return (
    <section id="featured" className="section-padding">
      <div className="container-main">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-accent">
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
          {products.map((product, idx) => (
            <ScrollReveal key={product.slug} delay={idx * 0.06}>
              <Link href={`/app/${product.slug}`}>
                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="h-full cursor-pointer"
                >
                  <div className="glass-card flex h-full flex-col rounded-3xl p-6">
                    <GlowingEffect
                      spread={40}
                      glow={true}
                      disabled={false}
                      proximity={64}
                      inactiveZone={0.01}
                      borderWidth={2}
                    />
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          className="h-10 w-10 shrink-0 rounded-xl object-cover"
                          src={
                            product.icon ||
                            `https://placehold.co/60x60/eee/white?text=${product.name.charAt(0)}`
                          }
                          alt={product.name}
                        />
                        <div>
                          <h3 className="text-sm font-semibold">
                            {product.name}
                          </h3>
                          <span className="text-[10px] text-[var(--color-text-secondary)]">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight
                        size={16}
                        className="text-[var(--color-text-secondary)]"
                      />
                    </div>

                    <p className="flex-1 text-sm text-[var(--color-text-secondary)]">
                      {product.tagline}
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-500" />
                        <span className="text-[13px] font-medium">
                          {product.rating}
                        </span>
                      </div>
                      {product.trending && (
                        <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5">
                          <TrendingUp
                            size={10}
                            className="text-emerald-500"
                          />
                          <span className="text-[10px] font-medium text-emerald-500">
                            {studio.trending}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
