"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useTranslations } from "@/lib/i18n";

export function Footnotes() {
  const pricing = useTranslations("pricing");
  const notes = pricing.footnotes;

  return (
    <div className="container-main mt-10">
      <ScrollReveal>
        <h3 className="mb-8 text-lg font-semibold">{pricing.footnoteTitle}</h3>
      </ScrollReveal>
      <div className="space-y-4">
        {notes.map((text, idx) => (
          <ScrollReveal key={idx} delay={(idx + 1) * 0.04}>
            <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              <sup className="mr-1 font-semibold text-[var(--color-text)]">
                ({idx + 1})
              </sup>
              {text}
            </p>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
