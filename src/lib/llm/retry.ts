import "server-only";

import { LlmError, getErrorType, toLlmError } from "@/lib/llm/errors";
import { logEvent } from "@/lib/llm/logger";
import type { RetryContext, RetryPolicy, RetryResult } from "@/lib/llm/types";

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  baseDelayMs: 300,
  maxDelayMs: 2000,
  jitterMs: 160,
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function computeBackoffDelay(attempt: number, policy: RetryPolicy): number {
  const raw = Math.min(
    policy.maxDelayMs,
    Math.round(policy.baseDelayMs * Math.pow(3, attempt - 1)),
  );
  const jitter = Math.floor(Math.random() * policy.jitterMs);
  return raw + jitter;
}

function attachRetryCount(error: LlmError, retryCount: number): LlmError {
  (error as LlmError & { retryCount?: number }).retryCount = retryCount;
  return error;
}

export async function withRetry<T>(input: {
  requestId: string;
  context: RetryContext;
  run: () => Promise<T>;
  policy?: Partial<RetryPolicy>;
}): Promise<RetryResult<T>> {
  const policy: RetryPolicy = {
    ...DEFAULT_RETRY_POLICY,
    ...input.policy,
  };

  let retries = 0;

  for (let attempt = 1; attempt <= policy.maxRetries + 1; attempt += 1) {
    try {
      const value = await input.run();
      return { value, retries };
    } catch (rawError) {
      const error = toLlmError(rawError);
      const shouldRetry = error.retryable && attempt <= policy.maxRetries;

      logEvent({
        event: "LLM_RETRY_ATTEMPT",
        requestId: input.requestId,
        provider: input.context.provider,
        model: input.context.model,
        retryCount: retries + 1,
        fallbackTriggered: false,
        status: "failed",
        errorType: getErrorType(error),
      });

      if (!shouldRetry) {
        throw attachRetryCount(error, retries);
      }

      retries += 1;
      await sleep(computeBackoffDelay(attempt, policy));
    }
  }

  throw new Error("Retry loop failed unexpectedly");
}
