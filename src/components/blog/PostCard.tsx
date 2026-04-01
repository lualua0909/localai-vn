import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/lib/blog-data";
import { GlowingEffect } from "@/components/ui/glowing-effect";

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
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={
                post.image ||
                post.coverImage ||
                "/api/blog-data/thumbnails/default-tech-cover.svg"
              }
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

          <div className="flex flex-1 flex-col p-5">
            <h2 className="mb-2 text-base font-semibold leading-snug transition-colors group-hover:text-accent">
              {post.title}
            </h2>
            <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {post.description || post.summary}
            </p>

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
