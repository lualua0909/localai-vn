"use client";

import { ReactNode } from "react";
import { ScrollReveal } from "./ScrollReveal";
import { DottedGlowBackground } from "./dotted-glow-background";
import { GlareCard } from "./glare-card";

interface BentoItemProps {
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
}

export function BentoGrid({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {children}
    </div>
  );
}

export function BentoItem({
  title,
  description,
  className = "",
  children
}: BentoItemProps) {
  return (
    <ScrollReveal>
      <GlareCard
        className={`glass-card relative overflow-hidden p-6 bg-white/85 text-[var(--color-text)] dark:bg-slate-900 border-[#fff] dark:border-slate-800 ${className}`}
      >
        <h3 className="mb-2 text-base font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {description}
        </p>
        {children}
      </GlareCard>
    </ScrollReveal>
  );
}
