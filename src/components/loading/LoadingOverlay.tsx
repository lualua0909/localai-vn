"use client";

import { cn } from "@/lib/utils";
import { ProgressCircle } from "./ProgressBar";

interface LoadingOverlayProps {
  visible?: boolean;
  label?: string;
  className?: string;
}

/** Full-area overlay with centered spinner. Use inside relative containers or as page overlay. */
export function LoadingOverlay({ visible = true, label, className }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[var(--color-bg)]/80 backdrop-blur-sm transition-opacity duration-300",
        className,
      )}
    >
      <ProgressCircle size={32} strokeWidth={2.5} />
      {label && (
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</p>
      )}
    </div>
  );
}
