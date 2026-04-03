"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** 0–100. Pass undefined for indeterminate mode. */
  value?: number;
  className?: string;
  label?: string;
}

export function ProgressBar({ value, className, label }: ProgressBarProps) {
  const indeterminate = value === undefined;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span>{label}</span>
          {!indeterminate && <span>{Math.round(value)}%</span>}
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
        {indeterminate ? (
          <div className="h-full w-1/3 animate-progress-indeterminate rounded-full bg-accent" />
        ) : (
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        )}
      </div>
    </div>
  );
}

interface ProgressCircleProps {
  /** 0–100 */
  value?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressCircle({
  value,
  size = 40,
  strokeWidth = 3,
  className,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = value !== undefined ? circumference - (value / 100) * circumference : circumference * 0.75;

  return (
    <svg
      width={size}
      height={size}
      className={cn(value === undefined && "animate-spin", className)}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-accent transition-all duration-500 ease-out"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
