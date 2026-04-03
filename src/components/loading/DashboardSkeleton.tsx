import { Skeleton } from "./Skeleton";

/** Dashboard table/list loader with header row + data rows. */
export function DashboardTableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-3">
        <Skeleton className="h-3 w-10 rounded-md" />
        <Skeleton className="h-3 w-40 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md ml-auto" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl p-3 animate-fade-in-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/5 rounded-md" />
            <Skeleton className="h-2.5 w-2/5 rounded-md" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Stats cards skeleton for dashboard overview. */
export function DashboardStatsLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 space-y-3 animate-fade-in-up"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-2.5 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}
