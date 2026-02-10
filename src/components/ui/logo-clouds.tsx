"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "@/lib/i18n";

interface Logo {
  name: string;
  src: string;
}

export function LogosWithBlurFlip({ logoSets }: { logoSets?: Logo[][] }) {
  const home = useTranslations("home");
  const defaultLogos: Logo[][] = [
    [
      { name: "FPT AI", src: "/logos/fpt.svg" },
      { name: "VinAI", src: "/logos/vinai.svg" },
      { name: "Zalo AI", src: "/logos/zalo.svg" },
      { name: "VNPT AI", src: "/logos/vnpt.svg" },
    ],
    [
      { name: "Viettel AI", src: "/logos/viettel.svg" },
      { name: "CMC AI", src: "/logos/cmc.svg" },
      { name: "Momo", src: "/logos/momo.svg" },
      { name: "Tiki", src: "/logos/tiki.svg" },
    ],
  ];

  const [logos, setLogos] = useState(logoSets || defaultLogos);
  const [activeLogoSet, setActiveLogoSet] = useState(logos[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const flipLogos = () => {
    setLogos((currentLogos) => {
      const newLogos = [...currentLogos.slice(1), currentLogos[0]];
      setActiveLogoSet(newLogos[0]);
      setIsAnimating(true);
      return newLogos;
    });
  };

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => flipLogos(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <section id="customers" className="section-padding">
      <div className="container-main">
        <div className="relative z-20 px-4 pt-10 md:px-8 md:pt-20">
          <h2 className="text-center text-section-title font-bold text-[var(--color-text)]">
            {home.integrations.title}
          </h2>
          <p className="mt-4 text-center text-base text-[var(--color-text-secondary)]">
            {home.integrations.description}
          </p>
          <div className="relative mt-20 flex h-full w-full flex-wrap justify-center gap-10 md:gap-10">
            <AnimatePresence
              mode="popLayout"
              onExitComplete={() => setIsAnimating(false)}
            >
              {activeLogoSet.map((logo, idx) => (
                <motion.div
                  initial={{ y: 40, opacity: 0, filter: "blur(10px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -40, opacity: 0, filter: "blur(10px)" }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1 * idx,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  key={logo.name + idx + "logo-flip"}
                  className="relative"
                >
                  <div className="flex h-20 w-40 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4">
                    <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                      {logo.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
