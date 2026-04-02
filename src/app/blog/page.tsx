"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PostCard } from "@/components/blog/PostCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import type { BlogPost } from "@/lib/blog-data";
import { useTranslations } from "@/lib/i18n";

function BlogContent() {
  const blog = useTranslations("blog");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blogs", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load blogs");
        }
        return response.json() as Promise<{ blogs: BlogPost[] }>;
      })
      .then((data) => setPosts(data.blogs))
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
      <section className="relative overflow-hidden">
        <BackgroundRippleEffect />
        <div className="container-main pointer-events-none relative z-10 mt-5 section-padding pb-0">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">{blog.hero.eyebrow}</p>
            <h1 className="text-hero-mobile font-bold tracking-tight sm:text-hero-desktop">
              {blog.hero.title}
            </h1>
            <p className="section-subtitle leading-relaxed sm:text-lg">
              {blog.hero.description}
            </p>
          </div>
        </div>
      </section>

      <div className="container-main section-padding">
        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? "pagination-page-active" : "pagination-page-inactive"}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
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
