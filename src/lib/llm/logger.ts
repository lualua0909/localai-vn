import "server-only";

import type { LogEvent } from "@/lib/llm/types";

function sanitizeMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) {
    return undefined;
  }

  const redacted: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lowered = key.toLowerCase();
    if (
      lowered.includes("key") ||
      lowered.includes("token") ||
      lowered.includes("secret") ||
      lowered.includes("authorization") ||
      lowered.includes("prompt") ||
      lowered.includes("messages") ||
      lowered.includes("content")
    ) {
      redacted[key] = "[REDACTED]";
      continue;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      redacted[key] = value;
      continue;
    }

    redacted[key] = "[REDACTED]";
  }

  return redacted;
}

export function logEvent(event: Omit<LogEvent, "timestamp">): void {
  const payload: LogEvent = {
    ...event,
    timestamp: new Date().toISOString(),
    metadata: sanitizeMetadata(event.metadata),
  };

  console.log(JSON.stringify(payload));
}
