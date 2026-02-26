"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { BlogPost } from "@/lib/blog-data";
import { getBlogs } from "@/lib/firestore";
import { useTranslations } from "@/lib/i18n";
import { PostCard } from "@/components/blog/PostCard";

function BlogContent() {
  const blog = useTranslations("blog");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogs()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 9;

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <>
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
                    )
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
          </>
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
