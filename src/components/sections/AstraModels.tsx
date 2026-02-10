"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import {
  Bot,
  Image,
  Code2,
  GraduationCap,
  Banknote,
  HeartPulse,
  Wrench,
  Sparkles
} from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export function AstraModels() {
  const models = useTranslations("home").models;
  const categories = models.categories.map((cat) => {
    const iconMap: Record<string, JSX.Element> = {
      bot: <Bot size={18} />,
      image: <Image size={18} />,
      code: <Code2 size={18} />,
      education: <GraduationCap size={18} />,
      finance: <Banknote size={18} />,
      health: <HeartPulse size={18} />,
      utility: <Wrench size={18} />,
      content: <Sparkles size={18} />
    };

    return {
      ...cat,
      icon: iconMap[cat.icon as keyof typeof iconMap] ?? <Sparkles size={18} />
    };
  });

  return (
    <section id="categories" className="section-padding">
      <div className="container-main">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-accent">
            {models.eyebrow}
          </p>
          <h2 className="text-section-title font-bold tracking-tight">
            {models.title}
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            {models.description}
          </p>
        </ScrollReveal>

        <div className="mt-14">
          <BentoGrid className="lg:grid-cols-4">
            {categories.map((cat, idx) => (
              <ScrollReveal key={cat.title} delay={idx * 0.05}>
                <BentoItem
                  title={cat.title}
                  description={cat.desc}
                  className="cursor-pointer"
                />
              </ScrollReveal>
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}
