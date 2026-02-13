"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap } from "lucide-react";
import { AppDetail } from "@/lib/app-data";

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ProductFeaturesProps {
  features: AppDetail["features"];
}

export function ProductFeatures({ features }: ProductFeaturesProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="mt-16">
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="typo-h2 mb-8"
      >
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
            <div className="rounded-2xl bg-white dark:bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-6 hover:shadow-sm transition-shadow duration-300">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-alt)] dark:bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-accent)] mb-4">
                <Zap size={18} />
              </div>
              <h4 className="typo-body font-semibold mb-2">
                {feat.title}
              </h4>
              <p className="typo-caption text-[var(--color-text-secondary)]">
                {feat.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
