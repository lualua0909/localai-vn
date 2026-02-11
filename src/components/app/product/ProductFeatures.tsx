"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Zap } from "lucide-react";
import { AppDetail } from "@/lib/app-data";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

const GLOW_COLORS = [
  "rgba(10, 132, 255, 0.85)",
  "rgba(168, 85, 247, 0.85)",
  "rgba(16, 185, 129, 0.85)",
  "rgba(245, 158, 11, 0.85)",
  "rgba(236, 72, 153, 0.85)",
  "rgba(34, 211, 238, 0.85)",
];

const DOT_COLORS = [
  "rgba(10, 132, 255, 0.5)",
  "rgba(168, 85, 247, 0.5)",
  "rgba(16, 185, 129, 0.5)",
  "rgba(245, 158, 11, 0.5)",
  "rgba(236, 72, 153, 0.5)",
  "rgba(34, 211, 238, 0.5)",
];

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ProductFeaturesProps {
  features: AppDetail["features"];
}

export function ProductFeatures({ features }: ProductFeaturesProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="mt-12">
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="text-lg font-semibold mb-5 flex items-center gap-2 tracking-tight"
      >
        <Sparkles size={20} className="text-[var(--color-accent)]" />
        Tính năng nổi bật
      </motion.h3>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {features.map((feat, idx) => (
          <motion.div key={idx} variants={staggerItem}>
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative rounded-2xl overflow-hidden"
            >
              <GlowingEffect
                spread={40}
                glow
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={1.5}
              />
              <div className="relative bg-white dark:bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border)] overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                {/* Visual header */}
                <div className="relative h-32 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-[var(--color-bg-alt)] to-[var(--color-bg)]">
                    <DottedGlowBackground
                      gap={14}
                      radius={1.5}
                      color={DOT_COLORS[idx % DOT_COLORS.length]}
                      glowColor={GLOW_COLORS[idx % GLOW_COLORS.length]}
                      opacity={0.7}
                      speedScale={0.6}
                    />
                  </div>
                  <div className="absolute bottom-3 left-4 w-10 h-10 rounded-xl bg-white/90 dark:bg-black/60 backdrop-blur-sm shadow-lg flex items-center justify-center text-[var(--color-accent)] group-hover:scale-110 transition-transform duration-300">
                    <Zap size={18} />
                  </div>
                </div>

                {/* Text content */}
                <div className="p-4 pt-3">
                  <h4 className="text-sm font-semibold mb-1.5">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
