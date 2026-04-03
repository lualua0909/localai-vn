import { cn } from "@/lib/utils";
import { Skeleton, SkeletonText, SkeletonImage } from "./Skeleton";

interface SkeletonCardProps {
  className?: string;
  /** Animation delay class for staggered grids, e.g. "delay-75" */
  delay?: string;
}

/** Generic content card skeleton matching .content-card layout. */
export function SkeletonCard({ className, delay }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "animate-fade-in-up overflow-hidden rounded-2xl bg-[var(--color-card-bg)] shadow-card",
        delay,
        className,
      )}
      style={delay ? { animationDelay: delay.replace("delay-", "") + "ms" } : undefined}
    >
      {/* Thumbnail */}
      <SkeletonImage />

      {/* Body */}
      <div className="space-y-3 p-5">
        {/* Title */}
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <Skeleton className="h-4 w-3/5 rounded-md" />
        {/* Description */}
        <div className="pt-1">
          <SkeletonText lines={2} />
        </div>
        {/* Meta row */}
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
          <Skeleton className="ml-auto h-3 w-14 rounded-md" />
        </div>
      </div>
    </div>
  );
}
