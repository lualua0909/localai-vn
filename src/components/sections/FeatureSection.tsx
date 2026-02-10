"use client";

import { ReactNode } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";

interface FeatureSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  media: ReactNode;
  reverse?: boolean;
}

export function FeatureSection({
  id,
  eyebrow,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  media,
  reverse = false,
}: FeatureSectionProps) {
  return (
    <section id={id} className="section-padding">
      <div
        className={`container-main grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${reverse ? "lg:[&>:first-child]:order-2" : ""
          }`}
      >
        {/* Text */}
        <div>
          <ScrollReveal>
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-accent">
              {eyebrow}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="text-section-title font-bold tracking-tight">
              {title}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.16}>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
              {subtitle}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.24}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={ctaPrimary.href} variant="primary" size="md">
                {ctaPrimary.label}
              </Button>
              <Button href={ctaSecondary.href} variant="ghost" size="md">
                {ctaSecondary.label}
              </Button>
            </div>
          </ScrollReveal>
        </div>

        {/* Media */}
        <ScrollReveal delay={0.1} direction={reverse ? "left" : "right"}>
          <div className="relative">{media}</div>
        </ScrollReveal>
      </div>
    </section>
  );
}
