import { cn } from "@/lib/utils";
import { Skeleton, SkeletonText } from "./Skeleton";

/** Matches CourseCard layout: thumbnail + badges + title + desc + meta row. */
export function CourseCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-[var(--color-card-bg)] shadow-card", className)}>
      {/* Thumbnail */}
      <div className="relative">
        <Skeleton className="aspect-[16/10] w-full rounded-none" />
        {/* Badge placeholders */}
        <div className="absolute left-3 top-3 flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      {/* Body */}
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <SkeletonText lines={2} className="pt-1" />
        {/* Meta row: lessons / duration / students */}
        <div className="flex items-center gap-4 border-t border-[var(--color-border)] pt-3">
          <Skeleton className="h-3 w-14 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-md" />
          <Skeleton className="h-3 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Grid of CourseCardSkeletons with staggered entrance. */
export function CourseGridLoader({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <CourseCardSkeleton />
        </div>
      ))}
    </div>
  );
}

/** Course detail page skeleton matching CourseDetailClient layout. */
export function CourseDetailLoader() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <Skeleton className="h-48 w-full rounded-2xl sm:h-64" />

      {/* Quick stats */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[24px] border border-[rgba(17,17,17,0.1)] bg-white/65 p-5 space-y-3"
          >
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <Skeleton className="h-2.5 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
        {/* Main content */}
        <div className="space-y-8">
          {/* Description card */}
          <div className="rounded-[30px] border border-[rgba(17,17,17,0.12)] bg-white/60 p-6 sm:p-8 space-y-4">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <SkeletonText lines={4} />
          </div>
          {/* Curriculum card */}
          <div className="rounded-[30px] border border-[rgba(17,17,17,0.12)] bg-white/60 p-6 sm:p-8 space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[26px] border border-[rgba(17,17,17,0.1)] bg-[#faf7f0] p-5 space-y-2">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        {/* Sidebar */}
        <div className="rounded-[30px] border border-[rgba(17,17,17,0.12)] bg-[#f3efe5] p-6 space-y-5 xl:self-start">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="space-y-3 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
