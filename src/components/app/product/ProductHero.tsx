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
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { GlowingEffect } from "@/components/ui/glowing-effect";

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
      <div className="rounded-2xl bg-white dark:bg-[var(--color-bg-alt)] shadow-md overflow-hidden hover:shadow-xl transition-transform duration-300">
        {/* Content */}
        <div className="px-6 sm:px-8 py-8">
          {/* App icon + name */}
          <div className="flex items-start gap-5 mb-6">
            <img
              src={app.icon}
              alt={app.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] shadow-sm object-cover bg-white shrink-0"
            />
            <div className="flex-1 min-w-0 pt-1">
              <Badge variant="accent" size="md" className="mb-2">
                {app.category}
              </Badge>
              <h1 className="typo-h1 truncate">{app.name}</h1>
            </div>
          </div>

          {/* Tagline */}
          <p className="typo-body text-[var(--color-text-secondary)] mb-5">
            {app.tagline}
          </p>

          {/* Rating row */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="typo-body font-semibold text-[var(--color-text)]">
                {app.rating}
              </span>
            </div>
            <span className="text-[var(--color-border)]">·</span>
            <Link
              href="#reviews"
              className="typo-caption text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            >
              {app.reviewsCount
                ? `${app.reviewsCount} đánh giá`
                : "Chưa có đánh giá"}
            </Link>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
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
          <div className="border-t border-[var(--color-border)] mt-8 pt-6">
            <div className="flex items-center justify-between gap-4">
              {/* Upvote */}
              <div className="flex items-center gap-3">
                <Button
                  variant={upvoted ? "primary" : "outline"}
                  size="sm"
                  icon={<ArrowUpCircle size={16} />}
                  onClick={onToggleUpvote}
                  className={
                    upvoted ? "shadow-md shadow-[var(--color-accent)]/25" : ""
                  }
                >
                  {upvoted ? "Đã vote" : "Upvote"}
                </Button>
                <motion.span
                  key={upvoteCount}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="typo-body font-semibold text-[var(--color-accent)]"
                >
                  {upvoteCount}
                </motion.span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar name={app.author} size="sm" />
                <div className="text-right">
                  <p className="typo-body font-semibold leading-tight">
                    {app.author}
                  </p>
                  <p className="typo-caption text-[var(--color-text-secondary)]">
                    @{app.author.toLowerCase().replace(/\s+/g, "")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
