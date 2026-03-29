"use client";

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({
  progress,
  showLabel = true,
  size = "sm",
}: ProgressBarProps) {
  const height = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-1 ${height} rounded-full bg-[var(--color-border)] overflow-hidden`}
      >
        <div
          className={`${height} rounded-full bg-accent transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="typo-caption text-[var(--color-text-secondary)] whitespace-nowrap">
          {progress}%
        </span>
      )}
    </div>
  );
}
