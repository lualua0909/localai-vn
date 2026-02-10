"use client";

import dynamic from "next/dynamic";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

const MacbookScroll = dynamic(
  () =>
    import("@/components/ui/macbook-scroll").then((m) => ({
      default: m.MacbookScroll,
    })),
  { ssr: false }
);

export function HeroSection() {
  return (
    <section
      id="overview"
      className="relative overflow-hidden"
    >
      <BackgroundRippleEffect />

      {/* Text Hover Effect Title */}
      <div className="container-main relative z-10 pt-32">
        <div className="mx-auto flex h-[12rem] max-w-4xl items-center justify-center">
          <TextHoverEffect text="LocalAI" duration={0.3} />
        </div>
        <p className="mx-auto mt-2 max-w-xl text-center text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          Mỗi ngày, người Việt đang biến ý tưởng thành sản phẩm AI.
          Đây là nơi để bạn khám phá, ủng hộ, hoặc trở thành một trong số họ.
        </p>
      </div>

      {/* MacBook Scroll */}
      <div className="relative z-10 w-full overflow-hidden bg-[var(--color-bg)]">
        <MacbookScroll
          title={
            <span className="text-[var(--color-text)]">
              Nền tảng khám phá sản phẩm AI
              <br />
              <span className="text-gradient">do người Việt xây dựng.</span>
            </span>
          }
          showGradient={true}
        />
      </div>
    </section>
  );
}
