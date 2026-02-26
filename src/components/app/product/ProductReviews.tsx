"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Send } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { GlowCard } from "@/components/ui/GlowCard";
import { StarRating } from "@/components/ui/StarRating";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export interface Comment {
  user: string;
  text: string;
  date: string;
  rating?: number;
}

interface ProductReviewsProps {
  appRating: number;
  initialComments?: Comment[];
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function ProductReviews({
  appRating,
  initialComments = [],
}: ProductReviewsProps) {
  const { user } = useAuth();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(
    initialComments.length > 0
      ? initialComments
      : [
          {
            user: "Sarah Nguyen",
            text: "Truly a game changer for my workflow!",
            date: "2 ngày trước",
            rating: 5,
          },
          {
            user: "Minh Tran",
            text: "The AI responses are surprisingly human-like.",
            date: "1 tuần trước",
            rating: 4,
          },
        ],
  );

  const avgRating =
    comments.length > 0
      ? (
          comments.reduce((acc, c) => acc + (c.rating || 0), 0) /
          comments.length
        ).toFixed(1)
      : appRating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    setComments([
      {
        user: user.displayName || "User",
        text: comment,
        date: "Vừa xong",
        rating,
      },
      ...comments,
    ]);
    setComment("");
    setRating(5);
  };

  return (
    <motion.div
      ref={ref}
      id="reviews"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="mt-16 pt-12 border-t border-[var(--color-border)]"
    >
      <h3 className="typo-h2 mb-8">Đánh giá &amp; Bình luận</h3>

      <GlowCard className="mb-10">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Rating summary */}
          <div className="flex flex-col items-center justify-center sm:border-r sm:border-[var(--color-border)] sm:pr-10 py-2">
            <div className="typo-display-l text-[var(--color-text)] mb-1">
              {avgRating}
            </div>
            <StarRating value={Number(avgRating)} size={16} />
            <p className="typo-caption text-[var(--color-text-secondary)] whitespace-nowrap mt-2">
              {comments.length} đánh giá
            </p>
          </div>

          {/* Comment form or login */}
          <div className="flex-1 min-w-0">
            {user ? (
              <form onSubmit={handleSubmit}>
                <div className="flex gap-4 items-start">
                  <Avatar
                    name={user.displayName || "User"}
                    size="md"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <StarRating
                      value={rating}
                      size={20}
                      interactive
                      onChange={setRating}
                      className="mb-3"
                    />
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Chia sẻ nhận xét của bạn..."
                      className="w-full typo-body bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] p-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 min-h-[80px] resize-y placeholder:text-[var(--color-text-secondary)] transition-all"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <p className="typo-caption text-[var(--color-text-secondary)]">
                        Maker sẽ nhận được thông báo
                      </p>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        icon={<Send size={13} />}
                        disabled={!comment.trim()}
                        className="disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Gửi
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="typo-body text-[var(--color-text-secondary)] mb-4">
                  Đăng nhập để viết bình luận
                </p>
                <Button variant="secondary" size="sm" href="/signin">
                  Đăng nhập
                </Button>
                <p className="typo-caption text-[var(--color-text-secondary)] mt-4">
                  Maker sẽ nhận được thông báo
                </p>
              </div>
            )}
          </div>
        </div>
      </GlowCard>

      {/* Comments list */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="space-y-2"
      >
        {comments.map((c, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="flex gap-4 group p-5 rounded-2xl hover:bg-[var(--color-bg-alt)]/60 transition-colors"
          >
            <Avatar name={c.user} size="sm" className="mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="typo-body font-semibold">{c.user}</span>
                {c.rating && <StarRating value={c.rating} size={10} />}
                <span className="typo-caption text-[var(--color-text-secondary)]">
                  · {c.date}
                </span>
              </div>
              <p className="typo-body text-[var(--color-text-secondary)]">
                {c.text}
              </p>
              <div className="flex gap-4 mt-3">
                <button className="typo-caption text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                  Trả lời
                </button>
                <button className="typo-caption text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                  Thích
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {comments.length === 0 && (
          <p className="text-center typo-body text-[var(--color-text-secondary)] py-12">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
