"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "@/lib/i18n";

const HEADER_H = 48;

export function SubNav() {
  const [active, setActive] = useState("overview");
  const pills = useTranslations("common").subnav;

  useEffect(() => {
    const handleScroll = () => {
      const offsets = pills
        .map((p) => {
          const el = document.getElementById(p.id);
          return el
            ? { id: p.id, top: el.getBoundingClientRect().top }
            : null;
        })
        .filter(Boolean) as { id: string; top: number }[];

      const threshold = HEADER_H + 80;
      let current = offsets[0]?.id ?? "overview";
      for (const o of offsets) {
        if (o.top <= threshold) current = o.id;
      }
      setActive(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_H - 56;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="sticky top-12 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
      <div className="container-main scrollbar-hide flex gap-1 overflow-x-auto py-2.5">
        {pills.map((p) => (
          <button
            key={p.id}
            onClick={() => scrollTo(p.id)}
            className="focus-ring relative shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
          >
            {active === p.id && (
              <motion.span
                layoutId="subnav-pill"
                className="absolute inset-0 rounded-full bg-[var(--color-text)]/10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 ${active === p.id
                  ? "text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)]"
                }`}
            >
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
