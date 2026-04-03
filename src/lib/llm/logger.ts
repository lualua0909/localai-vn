import "server-only";

import type { LogEvent } from "@/lib/llm/types";

type RequestLogListener = (event: LogEvent) => void;

const requestListeners = new Map<string, Set<RequestLogListener>>();

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

  const listeners = requestListeners.get(payload.requestId);
  if (!listeners) {
    return;
  }

  for (const listener of Array.from(listeners)) {
    listener(payload);
  }
}

export function subscribeToLlmRequest(
  requestId: string,
  listener: RequestLogListener,
): () => void {
  const listeners =
    requestListeners.get(requestId) ?? new Set<RequestLogListener>();
  listeners.add(listener);
  requestListeners.set(requestId, listeners);

  return () => {
    const current = requestListeners.get(requestId);
    if (!current) {
      return;
    }

    current.delete(listener);
    if (current.size === 0) {
      requestListeners.delete(requestId);
    }
  };
}
