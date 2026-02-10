"use client";

import dynamic from "next/dynamic";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { useTranslations } from "@/lib/i18n";

const MacbookScroll = dynamic(
  () =>
    import("@/components/ui/macbook-scroll").then((m) => ({
      default: m.MacbookScroll
    })),
  { ssr: false }
);

export function HeroSection() {
  const home = useTranslations("home");
  const [taglineLine1, taglineLine2] = home.hero.tagline;

  return (
    <section id="overview" className="relative overflow-hidden">
      <BackgroundRippleEffect />

      {/* Text Hover Effect Title */}
      <div className="container-main relative z-10 pt-32">
        <div className="mx-auto flex h-[12rem] max-w-4xl items-center justify-center">
          <TextHoverEffect text={home.hero.title} duration={0.3} />
        </div>
        <p className="mx-auto mt-2 max-w-xl text-center text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          {taglineLine1}
          <br />
          {taglineLine2}
        </p>
      </div>

      {/* MacBook Scroll */}
      <div className="relative z-10 w-full overflow-hidden bg-[var(--color-bg)]">
        <MacbookScroll
          title={
            <span className="text-[var(--color-text)]">
              {home.macbook.titleLine1}
              <br />
              <span className="text-gradient">
                {home.macbook.titleHighlight}
              </span>
            </span>
          }
        />
      </div>
    </section>
  );
}
