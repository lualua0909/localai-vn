"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getBlogPost, blogPosts } from "@/lib/blog-data";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TracingBeam } from "@/components/ui/tracing-beam";

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="mb-4 mt-12 text-2xl font-bold tracking-tight first:mt-0"
        >
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mb-3 mt-8 text-xl font-semibold">
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
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

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
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

    // Unordered list
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
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

    // Paragraph
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
      i++;
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

function renderInline(text: string): React.ReactNode {
  // Bold
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

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Không tìm thấy bài viết</h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              Bài viết bạn đang tìm kiếm không tồn tại.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              <ArrowLeft size={14} />
              Quay lại Blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Related posts (exclude current)
  const related = blogPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <>
      <Header />
      <main className="pt-20">
        <article className="container-main section-padding pb-0">
          {/* Back link */}
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            >
              <ArrowLeft size={14} />
              Quay lại Blog
            </Link>
          </div>

          {/* Header */}
          <header className="mx-auto mt-8 max-w-3xl text-center">
            <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              {post.category}
            </span>

            <h1 className="mt-6 text-hero-mobile font-bold tracking-tight sm:text-hero-desktop">
              {post.title}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
              {post.description}
            </p>

            {/* Author & Meta */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <span className="text-sm font-bold text-accent">
                  {post.author.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{post.author}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {post.date} · {post.readTime}
                </p>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl">
            <div className="relative aspect-[2/1] w-full">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
          </div>

          {/* Article Body with Tracing Beam */}
          <TracingBeam className="mt-12 max-w-3xl">
            <div className="prose-custom">{renderMarkdown(post.content)}</div>

            {/* Divider */}
            <div className="mt-16 border-t border-[var(--color-border)]" />

            {/* Author Card */}
            <div className="mt-10">
              <div className="glass-card flex items-center gap-5 rounded-2xl p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <span className="text-lg font-bold text-accent">
                    {post.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Viết bởi {post.author}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Thành viên cộng đồng LocalAI. Đam mê công nghệ AI và chia sẻ
                    kiến thức với cộng đồng developer Việt Nam.
                  </p>
                </div>
              </div>
            </div>
          </TracingBeam>
        </article>

        {/* Related Posts */}
        <section className="container-main section-padding">
          <h2 className="mb-8 text-center text-xl font-bold">
            Bài viết liên quan
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rp) => (
              <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group">
                <article className="glass-card flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={rp.image}
                      alt={rp.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[var(--color-bg)]/80 px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm">
                      {rp.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-sm font-semibold leading-snug transition-colors group-hover:text-accent">
                      {rp.title}
                    </h3>
                    <p className="flex-1 text-xs text-[var(--color-text-secondary)]">
                      {rp.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                      <span className="text-[11px] font-medium">
                        {rp.author}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-secondary)]">
                        {rp.date}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
