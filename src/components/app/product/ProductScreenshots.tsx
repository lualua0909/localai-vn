"use client";

import { motion } from "framer-motion";
import { AppDetail } from "@/lib/app-data";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

interface ProductScreenshotsProps {
  app: AppDetail;
}

export function ProductScreenshots({ app }: ProductScreenshotsProps) {
  if (!app.screenshots || app.screenshots.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="-mx-4 sm:-mx-6"
    >
      <Carousel
        items={app.screenshots.map((src, i) => (
          <Card
            key={i}
            index={i}
            layout
            card={{
              src,
              title: `${app.name} - Screenshot ${i + 1}`,
              category: app.category,
              content: (
                <div className="space-y-4">
                  <img
                    src={src}
                    alt={`${app.name} screenshot ${i + 1}`}
                    className="w-full rounded-2xl"
                  />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {app.tagline}
                  </p>
                </div>
              ),
            }}
          />
        ))}
      />
    </motion.div>
  );
}
