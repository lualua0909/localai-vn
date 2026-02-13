"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogPost, blogPosts } from "@/lib/blog-data";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n";
import { GlowingEffect } from "@/components/ui/glowing-effect";

function BlogContent() {
  const blog = useTranslations("blog");
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 9;

  const totalPages = Math.ceil(blogPosts.length / itemsPerPage);
  const paginatedPosts = blogPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header />
      {/* Header */}
      <div className="container-main section-padding pb-0 mt-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-accent">
            {blog.hero.eyebrow}
          </p>
          <h1 className="text-hero-mobile font-bold tracking-tight sm:text-hero-desktop">
            {blog.hero.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
            {blog.hero.description}
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container-main section-padding">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </ul>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--color-text)]/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                        : "hover:bg-[var(--color-text)]/5 text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--color-text)]/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BlogContent />
    </Suspense>
  );
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <div key={post.slug} className="relative h-full rounded-2xl shadow-xl">
      <GlowingEffect
        spread={40}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-[var(--color-card-bg)]">
          {/* Image */}
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <span className="absolute left-3 top-3 rounded-full bg-[var(--color-bg)]/80 px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm">
              {post.category}
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5">
            <h2 className="mb-2 text-base font-semibold leading-snug transition-colors group-hover:text-accent">
              {post.title}
            </h2>
            <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {post.description}
            </p>

            {/* Author & Date */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-[13px] font-medium">{post.author}</span>
              <span className="text-[13px] text-[var(--color-text-secondary)]">
                {post.date}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
