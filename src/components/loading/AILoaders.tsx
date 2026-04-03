"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

/** Pulsing dots indicator for AI "thinking" state. */
export function AIThinkingIndicator({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-dot-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      {label && (
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
      )}
    </div>
  );
}

/** Simulated AI text generation with typing cursor. */
export function AIGeneratingText({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10">
        <Sparkles size={14} className="text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        {text ? (
          <p className="text-sm leading-relaxed text-[var(--color-text)]">
            {text}
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-typing-cursor bg-accent" />
          </p>
        ) : (
          <div className="space-y-2">
            <div className="h-3.5 w-4/5 animate-pulse-soft rounded bg-accent/10" />
            <div className="h-3.5 w-3/5 animate-pulse-soft rounded bg-accent/10" />
            <span className="inline-block h-4 w-0.5 animate-typing-cursor bg-accent" />
          </div>
        )}
      </div>
    </div>
  );
}

interface Step {
  label: string;
  status: "pending" | "active" | "done";
}

/** Multi-step AI progress indicator. */
export function AIProgressSteps({
  steps,
  className,
}: {
  steps: Step[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          {/* Step indicator */}
          <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
            {step.status === "done" ? (
              <div className="h-5 w-5 rounded-full bg-accent/15 flex items-center justify-center">
                <svg width={12} height={12} viewBox="0 0 12 12" className="text-accent">
                  <path d="M3 6l2 2 4-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : step.status === "active" ? (
              <div className="h-5 w-5 rounded-full border-2 border-accent/40 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border border-[var(--color-border)]" />
            )}
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="absolute top-6 left-1/2 h-2 w-px -translate-x-1/2 bg-[var(--color-border)]" />
            )}
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              step.status === "done" && "text-[var(--color-text-secondary)]",
              step.status === "active" && "text-accent",
              step.status === "pending" && "text-[var(--color-text-secondary)]/60",
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
