import { cn } from "@/lib/utils";
import { Skeleton, SkeletonText } from "./Skeleton";

/** Matches PostCard layout: thumbnail (16/10) + body with title, desc, author/date. */
export function BlogSkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-[var(--color-card-bg)] shadow-card", className)}>
      {/* Thumbnail */}
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      {/* Body */}
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-3/5 rounded-md" />
        <SkeletonText lines={2} className="pt-1" />
        {/* Author / date row */}
        <div className="flex items-center justify-between pt-3">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Grid of BlogSkeletonCards with staggered animation. */
export function BlogListLoader({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <BlogSkeletonCard />
        </div>
      ))}
    </div>
  );
}

/** Full article page skeleton: hero image + article body. */
export function BlogArticleLoader() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      {/* Hero image */}
      <Skeleton className="aspect-[2/1] w-full rounded-2xl" />
      {/* Title */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-4/5 rounded-lg" />
        <Skeleton className="h-8 w-3/5 rounded-lg" />
      </div>
      {/* Meta */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      </div>
      {/* Paragraphs */}
      <div className="space-y-4">
        <SkeletonText lines={4} />
        <SkeletonText lines={3} />
        <Skeleton className="aspect-[16/9] w-full rounded-xl" />
        <SkeletonText lines={5} />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}
