import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Base shimmer skeleton block. Compose with width/height/rounded via className. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-lg bg-black/[0.06] dark:bg-white/[0.06]",
        className,
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-black/[0.04] to-transparent dark:via-white/[0.06]" />
    </div>
  );
}

/** Skeleton text line. Defaults to full width, single line height. */
export function SkeletonText({
  className,
  lines = 1,
}: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3.5 rounded-md",
            i === lines - 1 && lines > 1 ? "w-3/5" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

/** Circular avatar skeleton. */
export function SkeletonAvatar({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} />;
}

/** Image placeholder skeleton matching content-card-thumbnail aspect. */
export function SkeletonImage({ className }: SkeletonProps) {
  return <Skeleton className={cn("aspect-[16/10] w-full rounded-none", className)} />;
}
