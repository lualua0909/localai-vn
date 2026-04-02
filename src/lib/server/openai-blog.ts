import "server-only";

import type {
  GeneratedBlogDraft,
  ReadmeAnalysis,
  TrendingRepository,
} from "@/lib/blog-data";
import { llm } from "@/lib/llm/gateway";
import type { LlmProvider } from "@/lib/llm/gateway";
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
    labels.push("openrouter:auto-free");
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
  callbacks?.onAttemptStart?.({
    index: 0,
    total: 1,
    provider: "openai",
    model: process.env.OPENAI_BLOG_WRITER_MODEL || "gpt-4.1",
    label: `openai:${process.env.OPENAI_BLOG_WRITER_MODEL || "gpt-4.1"}`,
  });

  const response = await llm.chat({
    messages: buildBlogRewriteMessages(input),
    temperature: 0.4,
    maxTokens: Number.parseInt(
      process.env.OPENAI_BLOG_WRITER_MAX_TOKENS || "2200",
      10,
    ),
    metadata: {
      feature: "blog-rewrite",
      repo: input.repository.repoFullName,
      language: input.repository.language,
    },
  });

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
