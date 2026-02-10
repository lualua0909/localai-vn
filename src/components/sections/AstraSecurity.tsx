"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Zap, Users, Globe, Eye } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

const colorClassMap: Record<string, string> = {
  "bg-amber-500/10 text-amber-500": "bg-amber-500/10 text-amber-500",
  "bg-blue-500/10 text-blue-500": "bg-blue-500/10 text-blue-500",
  "bg-purple-500/10 text-purple-500": "bg-purple-500/10 text-purple-500",
  "bg-emerald-500/10 text-emerald-500": "bg-emerald-500/10 text-emerald-500",
};

export function AstraSecurity() {
  const security = useTranslations("home").security;
  const iconMap = {
    zap: <Zap size={24} />,
    users: <Users size={24} />,
    eye: <Eye size={24} />,
    globe: <Globe size={24} />,
  };
  const benefits = security.benefits.map((benefit) => ({
    ...benefit,
    icon: iconMap[benefit.icon as keyof typeof iconMap] || <Zap size={24} />,
  }));

  return (
    <section id="community" className="section-padding">
      <div className="container-main">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-accent">
            {security.eyebrow}
          </p>
          <h2 className="text-section-title font-bold tracking-tight">
            {security.title}
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            {security.description}
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {benefits.map((item, idx) => (
            <ScrollReveal key={item.title} delay={idx * 0.08}>
              <div className="glass-card flex items-start gap-5 rounded-3xl p-8">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${colorClassMap[item.color] ?? "bg-neutral-200 text-neutral-700"
                    }`}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {item.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
