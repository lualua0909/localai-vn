"use client";

import { GlowingEffect } from "./glowing-effect";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  spread?: number;
  proximity?: number;
  borderWidth?: number;
}

export function GlowCard({
  children,
  className = "",
  spread = 40,
  proximity = 64,
  borderWidth = 1.5,
}: GlowCardProps) {
  return (
    <div className={`relative rounded-2xl ${className}`}>
      <GlowingEffect
        spread={spread}
        glow
        disabled={false}
        proximity={proximity}
        inactiveZone={0.01}
        borderWidth={borderWidth}
      />
      <div className="relative bg-white dark:bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border)] p-5">
        {children}
      </div>
    </div>
  );
}
