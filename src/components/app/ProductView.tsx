"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { AppDetail, getRelatedApps } from "@/lib/app-data";
import { Button } from "@/components/ui/Button";
import { AppCard } from "@/components/app/AppCard";
import { ArrowLeft, Star, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { CardSpotlight } from "../ui/card-spotlight";
import { GlowingEffect } from "../ui/glowing-effect";

interface ProductViewProps {
  app: AppDetail;
}

export function ProductView({ app }: ProductViewProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">(
    "overview"
  );
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<
    { user: string; text: string; date: string }[]
  >([
    {
      user: "Sarah Nguyen",
      text: "Truly a game changer for my workflow!",
      date: "2 days ago"
    },
    {
      user: "Minh Tran",
      text: "The AI responses are surprisingly human-like.",
      date: "1 week ago"
    }
  ]);

  const relatedApps = getRelatedApps(app.id);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newComment = {
      user: user?.displayName || "Anonymous User",
      text: comment,
      date: "Just now"
    };

    setComments([newComment, ...comments]);
    setComment("");
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container-main max-w-5xl">
        <Link
          href="/app"
          className="inline-flex items-center text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Explore
        </Link>

        {/* Hero Section */}
        <CardSpotlight
          className="relative glass-card rounded-3xl overflow-hidden p-1"
          color="#80f38f"
        >
          <div className="relative z-10 bg-[var(--color-bg)]/50 rounded-[22px] p-6 md:p-10 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <img
                src={app.icon}
                alt={app.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-lg object-cover bg-white"
              />

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                    {app.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {app.rating}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    ({app.reviewsCount} reviews)
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                  {app.name}
                </h1>
                <p className="text-lg text-[var(--color-text-secondary)] mb-6 max-w-2xl">
                  {app.tagline}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="rounded-xl px-8">
                    Get {app.name}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="rounded-xl border border-[var(--color-border)]"
                  >
                    Visit Website
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardSpotlight>

        {/* Tabs Navigation */}
        <div className="flex gap-8 border-b border-[var(--color-border)] mt-12 mb-8 px-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === "overview"
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            Overview
            {activeTab === "overview" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === "reviews"
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            Discussion & Reviews
            {activeTab === "reviews" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h3 className="text-xl font-semibold mb-4">
                    About {app.name}
                  </h3>
                  <div
                    className="prose dark:prose-invert max-w-none text-[var(--color-text-secondary)] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: app.description }}
                  />
                </section>

                {app.screenshots && app.screenshots.length > 0 && (
                  <section>
                    <h3 className="text-xl font-semibold mb-4">Gallery</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {app.screenshots.map((shot, idx) => (
                        <div
                          key={idx}
                          className="aspect-video bg-[var(--color-bg-alt)] rounded-xl overflow-hidden border border-[var(--color-border)]"
                        >
                          <img
                            src={shot}
                            alt={`Screenshot ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className="p-6 rounded-2xl glass-card relative">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <h3 className="font-semibold mb-4">App Highlights</h3>
                <div className="space-y-4">
                  {app.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0 text-[var(--color-accent)]">
                        <Zap size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{feat.title}</h4>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)] mb-2">
                    <span>Launched</span>
                    <span className="font-medium text-[var(--color-text)]">
                      {app.releaseDate || "09/02/2026"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)] mb-2">
                    <span>Views</span>
                    <span className="font-medium text-[var(--color-text)]">
                      {app.views || "9"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)] mb-3">
                    <span>Score</span>
                    <span className="font-medium text-[var(--color-text)]">
                      {app.score || "18"}
                    </span>
                  </div>

                  <div className="h-px bg-[var(--color-border)] my-3" />

                  <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)] mb-2">
                    <span>Developer</span>
                    <span className="font-medium text-[var(--color-text)]">
                      {app.author}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>Last Updated</span>
                    <span className="font-medium text-[var(--color-text)]">
                      Oct 24, 2024
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold">Community Discussion</h3>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {comments.length} posts
              </span>
            </div>

            {user ? (
              <>
                <div className="mb-10 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                    {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                  </div>
                  <form onSubmit={handleCommentSubmit} className="flex-1">
                    <div className="relative">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts or ask a question..."
                        className="w-full rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] min-h-[100px] resize-y"
                      />
                      <button
                        type="submit"
                        disabled={!comment.trim()}
                        className="absolute bottom-3 right-3 p-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                      Posting as{" "}
                      <span className="font-medium text-[var(--color-text)]">
                        {user.displayName || "User"}
                      </span>
                    </p>
                  </form>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((c, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-text-secondary)] font-medium">
                        {c.user[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{c.user}</span>
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            • {c.date}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          {c.text}
                        </p>
                        <div className="flex gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                            Reply
                          </button>
                          <button className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                            Like
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 p-6 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-[var(--color-bg-alt)] rounded-full flex items-center justify-center mb-4 border border-[var(--color-border)]">
                  <ShieldCheck
                    className="text-[var(--color-text-secondary)]"
                    size={20}
                  />
                </div>
                <h4 className="text-lg font-medium mb-2">
                  Members Only Content
                </h4>
                <p className="text-[var(--color-text-secondary)] mb-6 max-w-sm">
                  The discussion section is available exclusively to logged-in
                  members. Join our community to ask questions and share
                  feedback.
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => (window.location.href = "/signin")}>
                    Log In
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      (window.location.href = "/signin?mode=signup")
                    }
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Related Products Section */}
        {relatedApps.length > 0 && (
          <div className="mt-20 border-t border-[var(--color-border)] pt-12">
            <h3 className="text-2xl font-semibold mb-6">Related Products</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={{
                    name: app.name,
                    category: app.category,
                    rating: app.rating,
                    reviews: app.reviewsCount
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
