"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpCircle,
  Star,
  Globe,
  Bookmark,
  Share2,
  ExternalLink,
} from "lucide-react";
import { AppDetail } from "@/lib/app-data";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface ProductHeroProps {
  app: AppDetail;
  upvoted: boolean;
  upvoteCount: number;
  onToggleUpvote: () => void;
}

export function ProductHero({
  app,
  upvoted,
  upvoteCount,
  onToggleUpvote,
}: ProductHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative rounded-2xl overflow-hidden">
        <GlowingEffect
          spread={50}
          glow
          disabled={false}
          proximity={80}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <div className="relative bg-white dark:bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          {/* Gradient banner */}
          <div className="relative h-28 sm:h-36 bg-gradient-to-br from-indigo-500/90 via-blue-500/80 to-cyan-400/70 overflow-hidden">
            <DottedGlowBackground
              gap={16}
              radius={1.5}
              color="rgba(255,255,255,0.3)"
              glowColor="rgba(255,255,255,0.6)"
              opacity={0.5}
              speedScale={0.4}
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/20 to-transparent dark:from-black/20" />
          </div>

          {/* Content */}
          <div className="relative px-5 sm:px-6 pb-5">
            {/* Floating app icon */}
            <div className="-mt-12 mb-4 flex items-end gap-4">
              <img
                src={app.icon}
                alt={app.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-lg ring-4 ring-white dark:ring-[var(--color-bg-alt)] object-cover bg-white shrink-0"
              />
              <div className="pb-1 flex-1 min-w-0">
                <Badge variant="accent" size="md" className="mb-1.5">
                  {app.category}
                </Badge>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight truncate">
                  {app.name}
                </h1>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed mb-3">
              {app.tagline}
            </p>

            {/* Rating row */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-2.5 py-1.5">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {app.rating}
                </span>
              </div>
              <Link
                href="#reviews"
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
              >
                {app.reviewsCount
                  ? `${app.reviewsCount} đánh giá`
                  : "Chưa có đánh giá"}
              </Link>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="pill"
                size="md"
                icon={<Globe size={15} />}
                href="#"
              >
                Truy cập
                <ExternalLink size={12} className="opacity-60" />
              </Button>
              <Button variant="outline" size="sm" icon={<Bookmark size={14} />}>
                Lưu
              </Button>
              <Button variant="outline" size="sm" icon={<Share2 size={14} />}>
                Chia sẻ
              </Button>
            </div>

            {/* Divider + upvote & author */}
            <div className="border-t border-[var(--color-border)] mt-5 pt-4">
              <div className="flex items-center justify-between gap-4">
                {/* Upvote */}
                <div className="flex items-center gap-3">
                  <Button
                    variant={upvoted ? "primary" : "outline"}
                    size="sm"
                    icon={<ArrowUpCircle size={16} />}
                    onClick={onToggleUpvote}
                    className={
                      upvoted
                        ? "shadow-md shadow-[var(--color-accent)]/25"
                        : ""
                    }
                  >
                    {upvoted ? "Đã vote" : "Upvote"}
                  </Button>
                  <motion.span
                    key={upvoteCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-lg font-bold text-[var(--color-accent)]"
                  >
                    {upvoteCount}
                  </motion.span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-2.5">
                  <Avatar name={app.author} size="sm" />
                  <div className="text-right">
                    <p className="text-sm font-semibold leading-tight">
                      {app.author}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      @{app.author.toLowerCase().replace(/\s+/g, "")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
