import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/lib/blog-data";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GLOW_DEFAULTS } from "@/components/ui/glow-defaults";

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <div key={post.slug} className="relative h-full rounded-2xl shadow-card">
      <GlowingEffect {...GLOW_DEFAULTS} />
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article className="content-card">
          <div className="content-card-thumbnail">
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
            <div className="content-card-thumbnail-overlay" />
            <span className="absolute left-3 top-3 chip-filled">
              {post.category}
            </span>
          </div>

          <div className="content-card-body">
            <h2 className="content-card-title">
              {post.title}
            </h2>
            <p className="content-card-desc">
              {post.description || post.summary}
            </p>

            <div className="flex items-center justify-between pt-4">
              <span className="text-[13px] font-medium">{post.author}</span>
              <span className="nav-link">{post.date}</span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
