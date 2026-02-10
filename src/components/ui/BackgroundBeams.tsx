"use client";

import { useEffect, useState } from "react";

export function BackgroundBeams({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches) setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute h-[40vh] w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent"
          style={{
            left: `${15 + i * 18}%`,
            top: "-20%",
            animation: `beamMove ${6 + i * 1.5}s linear infinite`,
            animationDelay: `${i * 1.2}s`,
            opacity: 0.4 + i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
