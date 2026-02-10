"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { blogPosts } from "@/lib/blog-data";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n";

export default function BlogPage() {
  const blog = useTranslations("blog");

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Header */}
        <div className="container-main section-padding pb-0">
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <article className="glass-card flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-300 group-hover:-translate-y-1">
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
                    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                      <span className="text-[13px] font-medium">
                        {post.author}
                      </span>
                      <span className="text-[13px] text-[var(--color-text-secondary)]">
                        {post.date}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
