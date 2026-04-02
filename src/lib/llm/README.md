# Internal LLM Gateway (Next.js + TypeScript)

This module provides a production-grade, server-only LLM gateway with:

- Provider chain: OpenAI -> Gemini -> OpenRouter
- Retries with exponential backoff + jitter
- Provider fallback and failover
- OpenRouter free-model auto discovery and ranking
- Structured JSON logging with redaction

## Files

- `gateway.ts`: Main app-facing API (`llm.chat`)
- `router.ts`: Retry + fallback orchestration
- `retry.ts`: Exponential retry utility
- `providers.ts`: Provider HTTP clients (fetch only)
- `openrouter.ts`: Free-model discovery + 10-minute memory cache
- `logger.ts`: Structured JSON logger with sensitive field redaction
- `errors.ts`: Error classes and classification
- `types.ts`: Shared strong typings

## Unified API

```ts
import { llm } from "@/lib/llm/gateway";

const result = await llm.chat({
  messages: [{ role: "user", content: "Explain black holes simply" }],
});

console.log(result.response.content);
```

## API Route Example

```ts
import { NextResponse } from "next/server";
import { llm } from "@/lib/llm/gateway";

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string };

  if (!body.prompt) {
    return NextResponse.json(
      { ok: false, error: "Missing prompt" },
      { status: 400 },
    );
  }

  const result = await llm.chat({
    messages: [{ role: "user", content: body.prompt }],
    temperature: 0.3,
    maxTokens: 600,
    metadata: { feature: "internal-chat-route" },
  });

  return NextResponse.json({
    ok: true,
    content: result.response.content,
    provider: result.response.provider,
    model: result.response.model,
    requestId: result.requestId,
  });
}
```

## Server Action Example

```ts
"use server";

import { llm } from "@/lib/llm/gateway";

export async function summarizeText(input: string) {
  const result = await llm.chat({
    messages: [
      {
        role: "system",
        content: "You summarize text in Vietnamese for developers.",
      },
      { role: "user", content: input },
    ],
    maxTokens: 500,
    metadata: { action: "summarizeText" },
  });

  return {
    summary: result.response.content,
    provider: result.response.provider,
    model: result.response.model,
    requestId: result.requestId,
  };
}
```

## Environment Variables

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`

Optional:

- `OPENAI_BLOG_WRITER_MODEL` (default: `gpt-4.1`)
- `GEMINI_BLOG_WRITER_MODEL` (default: `gemini-2.0-flash`)
- `OPENROUTER_BLOG_WRITER_MODEL` (optional fallback model id)
- `OPENROUTER_APP_NAME` (default: `localai-vn`)
- `NEXT_PUBLIC_APP_URL` (used as OpenRouter referer)

If a provider key is missing, that provider is auto-disabled.

## Retry Policy

Default retry policy before fallback:

- `maxRetries = 3`
- Exponential backoff progression: ~300ms, ~900ms, ~2000ms
- Random jitter added to each retry delay

## OpenRouter Free-Model Selection

When OpenRouter is reached in fallback chain:

1. Fetch `https://openrouter.ai/api/v1/models`
2. Keep models where `pricing.prompt == 0` and `pricing.completion == 0`
3. Rank by:
   - highest `context_length`
   - highest `top_provider.max_completion_tokens`
   - lowest `top_provider.latency`
4. Cache ranked list in memory for 10 minutes
5. Attempt top candidate first, then continue to next candidate if it fails

## Logging

Every request emits JSON logs, including:

- `timestamp`
- `provider`
- `model`
- `retryCount`
- `fallbackTriggered`
- `latency`
- `status`
- `errorType`
- `requestId`

Supported events:

- `LLM_REQUEST_STARTED`
- `LLM_REQUEST_SUCCESS`
- `LLM_RETRY_ATTEMPT`
- `LLM_PROVIDER_FAILED`
- `LLM_FALLBACK_TRIGGERED`
- `LLM_OPENROUTER_FREE_MODEL_SELECTED`

Sensitive values are redacted in metadata (`key`, `token`, `secret`, `authorization`, `prompt`, `messages`, `content`).

## Add A New Provider Later

1. Add provider config type in `types.ts`.
2. Add env loading in `loadProviderConfigFromEnv` in `providers.ts`.
3. Add provider call function in `providers.ts`.
4. Add provider stage to strict ordered chain in `router.ts`.
5. Add event logging for success/failure/fallback in `router.ts`.
6. Keep `gateway.ts` unchanged so app callers still use `llm.chat` only.
