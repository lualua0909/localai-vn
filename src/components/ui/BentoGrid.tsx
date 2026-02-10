"use client";

import { ReactNode } from "react";
import { ScrollReveal } from "./ScrollReveal";

interface BentoItemProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function BentoGrid({
  children,
  className = "",
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
  icon,
  className = "",
  children,
}: BentoItemProps) {
  return (
    <ScrollReveal>
      <div
        className={`glass-card group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${className}`}
      >
        {icon && (
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            {icon}
          </div>
        )}
        <h3 className="mb-2 text-base font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {description}
        </p>
        {children}
      </div>
    </ScrollReveal>
  );
}
