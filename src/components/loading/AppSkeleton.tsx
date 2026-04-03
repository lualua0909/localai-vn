import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

/** Matches AppCard layout: 14×14 icon + name/category/rating. */
export function AppCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl bg-[var(--color-card-bg)] p-4 shadow-card", className)}>
      {/* Icon */}
      <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3 rounded-md" />
        <Skeleton className="h-2.5 w-1/3 rounded-md" />
        <div className="flex items-center gap-3 pt-0.5">
          <Skeleton className="h-2.5 w-16 rounded-md" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Grid of AppCardSkeletons matching the 4-column app explore layout. */
export function AppGridLoader({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <AppCardSkeleton />
        </div>
      ))}
    </div>
  );
}
