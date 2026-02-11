"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppDetail, getRelatedApps } from "@/lib/app-data";
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

  const toggleUpvote = () => {
    setUpvoted((v) => !v);
    setUpvoteCount((c) => (upvoted ? c - 1 : c + 1));
  };

  const relatedApps = getRelatedApps(app.id);

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container-main max-w-6xl">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Sản phẩm", href: "/app" },
            { label: app.name },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-10">
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
              className="mt-10"
            >
              <div
                className="prose dark:prose-invert max-w-none text-[var(--color-text-secondary)] leading-[1.85] text-[15px]"
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
