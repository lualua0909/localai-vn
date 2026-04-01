"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PostCard } from "@/components/blog/PostCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TracingBeam } from "@/components/ui/tracing-beam";
import type { BlogPost } from "@/lib/blog-data";
import { useTranslations } from "@/lib/i18n";

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--color-text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="mb-4 mt-12 text-2xl font-bold tracking-tight first:mt-0"
        >
          {line.slice(3)}
        </h2>
      );
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mb-3 mt-8 text-xl font-semibold">
          {line.slice(4)}
        </h3>
      );
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i += 1;
      }
      elements.push(
        <blockquote
          key={key++}
          className="my-6 border-l-2 border-accent pl-6 italic text-[var(--color-text-secondary)]"
        >
          <p>{quoteLines.join(" ")}</p>
        </blockquote>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i += 1;
      }
      elements.push(
        <ol key={key++} className="my-4 list-decimal space-y-2 pl-6">
          {items.map((item, idx) => (
            <li key={idx} className="text-base leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i += 1;
      }
      elements.push(
        <ul key={key++} className="my-4 list-disc space-y-2 pl-6">
          {items.map((item, idx) => (
            <li key={idx} className="text-base leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("> ") &&
      !lines[i].startsWith("- ") &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }

    if (paraLines.length > 0) {
      elements.push(
        <p
          key={key++}
          className="my-4 text-base leading-[1.8] text-[var(--color-text-secondary)]"
        >
          {renderInline(paraLines.join(" "))}
        </p>
      );
    }
  }

  return elements;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const blogCopy = useTranslations("blogDetail");

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/blogs/${slug}`, { cache: "no-store" }).then(async (response) => {
        if (response.status === 404) {
          return { blog: null };
        }
        if (!response.ok) {
          throw new Error("Failed to fetch blog");
        }
        return response.json() as Promise<{ blog: BlogPost }>;
      }),
      fetch("/api/blogs", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }
        return response.json() as Promise<{ blogs: BlogPost[] }>;
      }),
    ]).then(([blogPost, allBlogs]) => {
      setPost(blogPost.blog);
      setRelated(allBlogs.blogs.filter((p) => p.slug !== slug).slice(0, 3));
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{blogCopy.notFound.title}</h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              {blogCopy.notFound.description}
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-0">
        <article className="container-main section-padding pb-0">
          <header className="mx-auto mt-8 max-w-3xl text-center">
            <h1 className="mt-6 text-hero-mobile font-bold tracking-tight sm:text-hero-desktop">
              {post.title}
            </h1>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <span className="text-sm font-bold text-accent">
                  {(post.author || "L").charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{post.author || "LocalAI Bot"}</p>
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                  {post.date} · {post.readTime}
                </p>
              </div>
            </div>
          </header>

          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl">
            <div className="relative aspect-[2/1] w-full">
              <Image
                src={
                  post.image ||
                  post.coverImage ||
                  "/api/blog-data/thumbnails/default-tech-cover.svg"
                }
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
          </div>

          <TracingBeam className="mt-12 max-w-3xl">
            <div className="prose-custom">{renderMarkdown(post.content)}</div>

            <div className="mt-16 border-t border-[var(--color-border)]" />

            <div className="mt-10">
              <div className="glass-card flex items-center gap-5 rounded-2xl p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <span className="text-lg font-bold text-accent">
                    {(post.author || "L").charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {blogCopy.authorBy.replace("{author}", post.author || "LocalAI Bot")}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {blogCopy.authorBio}
                  </p>
                </div>
              </div>
            </div>
          </TracingBeam>
        </article>

        <section className="container-main section-padding">
          <h2 className="mb-8 text-center text-xl font-bold">
            {blogCopy.relatedTitle}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rp) => (
              <PostCard key={rp.slug} post={rp} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
