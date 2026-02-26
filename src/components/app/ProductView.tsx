"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { AppDetail } from "@/lib/app-data";
import { getRelatedApps } from "@/lib/firestore";
import { Breadcrumb } from "./product/Breadcrumb";
import { ProductHero } from "./product/ProductHero";
import { ProductScreenshots } from "./product/ProductScreenshots";
import { ProductFeatures } from "./product/ProductFeatures";
import { ProductReviews } from "./product/ProductReviews";
import { ProductSidebar } from "./product/ProductSidebar";

interface ProductViewProps {
  app: AppDetail;
}

export function ProductView({ app }: ProductViewProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(app.score || 18);
  const [relatedApps, setRelatedApps] = useState<AppDetail[]>([]);

  useEffect(() => {
    getRelatedApps(app.id, app.category).then(setRelatedApps);
  }, [app.id, app.category]);

  const toggleUpvote = () => {
    setUpvoted((v) => !v);
    setUpvoteCount((c) => (upvoted ? c - 1 : c + 1));
  };

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container-main max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            <ProductHero
              app={app}
              upvoted={upvoted}
              upvoteCount={upvoteCount}
              onToggleUpvote={toggleUpvote}
            />

            <ProductScreenshots app={app} />

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12"
            >
              <div
                className="prose dark:prose-invert max-w-none typo-body text-[var(--color-text-secondary)]"
                dangerouslySetInnerHTML={{ __html: app.description }}
              />
            </motion.div>

            <ProductFeatures features={app.features} />

            <ProductReviews appRating={app.rating} />
          </div>

          {/* Right column */}
          <ProductSidebar app={app} relatedApps={relatedApps} />
        </div>
      </div>
    </div>
  );
}
