import "server-only";

import type {
  GeneratedBlogDraft,
  ReadmeAnalysis,
  TrendingRepository,
} from "@/lib/blog-data";
import { createLlmRequestId, llm } from "@/lib/llm/gateway";
import type { LlmProvider } from "@/lib/llm/gateway";
import { subscribeToLlmRequest } from "@/lib/llm/logger";
import type { LogEvent } from "@/lib/llm/types";
import { buildBlogRewriteMessages } from "@/lib/prompts/blogRewritePrompt";

type WriterProvider = LlmProvider;

export type WriterAttempt = {
  provider: WriterProvider;
  model: string;
  label: string;
  ok: boolean;
  error?: string;
};

export type GeneratedBlogResult = {
  draft: GeneratedBlogDraft;
  provider: WriterProvider;
  model: string;
  attempts: WriterAttempt[];
};

export type WriterProgressCallbacks = {
  onAttemptStart?: (attempt: {
    index: number;
    total: number;
    provider: WriterProvider;
    model: string;
    label: string;
  }) => void;
  onAttemptComplete?: (
    attempt: WriterAttempt & {
      index: number;
      total: number;
    },
  ) => void;
};

function getConfiguredWriterProviders(): WriterProvider[] {
  const providers: WriterProvider[] = [];
  if (process.env.OPENAI_API_KEY) {
    providers.push("openai");
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push("gemini");
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push("openrouter");
  }
  return providers.length > 0 ? providers : ["openai"];
}

function parseJson<T>(payload: string): T {
  const start = payload.indexOf("{");
  const end = payload.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain valid JSON");
  }

  return JSON.parse(payload.slice(start, end + 1)) as T;
}

function toWriterAttempt(
  index: number,
  total: number,
  attempt: {
    provider: WriterProvider;
    model: string;
    status: "success" | "failed";
    errorType?: string;
  },
): WriterAttempt & { index: number; total: number } {
  return {
    index,
    total,
    provider: attempt.provider,
    model: attempt.model,
    label: `${attempt.provider}:${attempt.model}`,
    ok: attempt.status === "success",
    error:
      attempt.status === "failed" ? attempt.errorType || "unknown" : undefined,
  };
}

export function getConfiguredWriterTargetLabels(): string[] {
  const labels: string[] = [];
  if (process.env.OPENAI_API_KEY) {
    labels.push(`openai:${process.env.OPENAI_BLOG_WRITER_MODEL || "gpt-4.1"}`);
  }
  if (process.env.GEMINI_API_KEY) {
    labels.push(
      `gemini:${process.env.GEMINI_BLOG_WRITER_MODEL || "gemini-2.0-flash"}`,
    );
  }
  if (process.env.OPENROUTER_API_KEY) {
    const configured = process.env.OPENROUTER_BLOG_WRITER_MODELS?.split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (configured && configured.length > 0) {
      for (const model of configured) {
        labels.push(`openrouter:${model}`);
      }
    } else {
      labels.push("openrouter:OPENROUTER_BLOG_WRITER_MODELS_not_set");
    }
  }
  return labels;
}

export async function generateVietnameseBlogArticleDetailed(
  input: {
    repository: TrendingRepository;
    analysis: ReadmeAnalysis;
  },
  callbacks?: WriterProgressCallbacks,
): Promise<GeneratedBlogResult> {
  const providers = getConfiguredWriterProviders();
  const total = providers.length;
  const requestId = createLlmRequestId();
  const started = new Set<string>();
  const completed = new Set<string>();

  const getIndex = (provider?: WriterProvider) => {
    if (!provider) {
      return 0;
    }
    const found = providers.indexOf(provider);
    return found >= 0 ? found : 0;
  };

  const ensureStart = (provider: WriterProvider, model: string) => {
    const label = `${provider}:${model}`;
    if (started.has(label)) {
      return;
    }
    started.add(label);
    callbacks?.onAttemptStart?.({
      index: getIndex(provider),
      total,
      provider,
      model,
      label,
    });
  };

  const unsubscribe = subscribeToLlmRequest(requestId, (event: LogEvent) => {
    if (!event.provider || !event.model) {
      return;
    }

    const label = `${event.provider}:${event.model}`;

    if (event.event === "LLM_RETRY_ATTEMPT") {
      ensureStart(event.provider, event.model);
      return;
    }

    if (event.event === "LLM_PROVIDER_FAILED") {
      ensureStart(event.provider, event.model);
      if (completed.has(label)) {
        return;
      }
      completed.add(label);
      callbacks?.onAttemptComplete?.({
        index: getIndex(event.provider),
        total,
        provider: event.provider,
        model: event.model,
        label,
        ok: false,
        error: event.errorType || "unknown",
      });
      return;
    }

    if (event.event === "LLM_REQUEST_SUCCESS") {
      ensureStart(event.provider, event.model);
      if (completed.has(label)) {
        return;
      }
      completed.add(label);
      callbacks?.onAttemptComplete?.({
        index: getIndex(event.provider),
        total,
        provider: event.provider,
        model: event.model,
        label,
        ok: true,
      });
    }
  });

  let response;
  try {
    response = await llm.chat({
      requestId,
      messages: buildBlogRewriteMessages(input),
      temperature: 0.4,
      maxTokens: Number.parseInt(
        process.env.OPENAI_BLOG_WRITER_MAX_TOKENS || "2200",
        10,
      ),
      metadata: {
        feature: "blog_writer",
        repo: input.repository.repoFullName,
        language: input.repository.language,
      },
    });
  } finally {
    unsubscribe();
  }

  const draft = parseJson<GeneratedBlogDraft>(response.response.content);

  if (
    !draft.title?.trim() ||
    !draft.summary?.trim() ||
    !draft.content?.trim()
  ) {
    throw new Error("Gateway response returned incomplete blog content");
  }

  const attempts = response.attempts.map((attempt) => ({
    provider: attempt.provider,
    model: attempt.model,
    label: `${attempt.provider}:${attempt.model}`,
    ok: attempt.status === "success",
    error:
      attempt.status === "failed" ? attempt.errorType || "unknown" : undefined,
  }));

  for (let index = 0; index < attempts.length; index += 1) {
    const label = attempts[index].label;
    if (completed.has(label)) {
      continue;
    }
    callbacks?.onAttemptComplete?.(
      toWriterAttempt(index, attempts.length, {
        provider: attempts[index].provider,
        model: attempts[index].model,
        status: attempts[index].ok ? "success" : "failed",
        errorType: attempts[index].error,
      }),
    );
  }

  return {
    draft,
    provider: response.response.provider,
    model: response.response.model,
    attempts,
  };
}

export async function generateVietnameseBlogArticle(input: {
  repository: TrendingRepository;
  analysis: ReadmeAnalysis;
}): Promise<GeneratedBlogDraft> {
  const result = await generateVietnameseBlogArticleDetailed(input);
  return result.draft;
}
