import "server-only";

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import type { ReadmeAnalysis, TrendingRepository } from "@/lib/blog-data";
import { slugify } from "@/lib/blog-data";
import { llm } from "@/lib/llm/gateway";
import type { LlmProvider } from "@/lib/llm/gateway";
import { buildThumbnailPromptMessages } from "@/lib/prompts/thumbnailPrompt";

const BLOG_DATA_DIR = join(process.cwd(), "blog-data");

type ThumbnailProvider = LlmProvider;

export type ThumbnailAttempt = {
  provider: ThumbnailProvider;
  model: string;
  label: string;
  ok: boolean;
  error?: string;
};

export type ThumbnailProgressCallbacks = {
  onAttemptStart?: (attempt: {
    index: number;
    total: number;
    provider: ThumbnailProvider;
    model: string;
    label: string;
  }) => void;
  onAttemptComplete?: (
    attempt: ThumbnailAttempt & {
      index: number;
      total: number;
    },
  ) => void;
};

type ThumbnailPromptPayload = {
  imagePrompt: string;
  styleKeywords?: string[];
  visualCue?: string;
};

function parseJson<T>(payload: string): T {
  const start = payload.indexOf("{");
  const end = payload.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain valid JSON");
  }

  return JSON.parse(payload.slice(start, end + 1)) as T;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function pickColorFromString(input: string, offset: number): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i) + offset) >>> 0;
  }

  const r = 80 + (hash % 120);
  const g = 80 + ((hash >> 8) % 120);
  const b = 80 + ((hash >> 16) % 120);

  return `rgb(${r},${g},${b})`;
}

function createThumbnailSvg(input: {
  title: string;
  subtitle: string;
  repository: TrendingRepository;
  visualCue?: string;
  imagePrompt: string;
}): string {
  const colorA = pickColorFromString(input.repository.language, 17);
  const colorB = pickColorFromString(input.repository.repoFullName, 41);
  const colorC = pickColorFromString(input.title, 73);
  const safeTitle = escapeXml(input.title);
  const safeSubtitle = escapeXml(input.subtitle);
  const safeCue = escapeXml(input.visualCue || input.repository.language);
  const safePrompt = escapeXml(input.imagePrompt.slice(0, 160));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1536" height="1024" viewBox="0 0 1536 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1536" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${colorA}" />
      <stop offset="55%" stop-color="${colorB}" />
      <stop offset="100%" stop-color="${colorC}" />
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1180 260) rotate(132) scale(420 360)">
      <stop stop-color="white" stop-opacity="0.38" />
      <stop offset="1" stop-color="white" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1536" height="1024" fill="url(#bg)"/>
  <rect width="1536" height="1024" fill="url(#glow)"/>
  <rect x="72" y="72" width="1392" height="880" rx="40" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)"/>

  <circle cx="1180" cy="360" r="170" fill="rgba(255,255,255,0.14)" />
  <circle cx="1210" cy="330" r="104" fill="rgba(255,255,255,0.20)" />

  <text x="150" y="360" font-size="84" font-family="ui-sans-serif, system-ui" font-weight="700" fill="white">${safeTitle}</text>
  <text x="150" y="438" font-size="42" font-family="ui-sans-serif, system-ui" font-weight="500" fill="rgba(255,255,255,0.95)">${safeSubtitle}</text>
  <text x="150" y="780" font-size="32" font-family="ui-sans-serif, system-ui" font-weight="600" fill="rgba(255,255,255,0.88)">Cue: ${safeCue}</text>
  <text x="150" y="836" font-size="24" font-family="ui-sans-serif, system-ui" fill="rgba(255,255,255,0.72)">Prompt: ${safePrompt}</text>
  <text x="150" y="900" font-size="22" font-family="ui-sans-serif, system-ui" fill="rgba(255,255,255,0.62)">Generated via internal LLM gateway</text>
</svg>`;
}

export function getConfiguredThumbnailTargetLabels(): string[] {
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

export async function generateBlogThumbnail(
  input: {
    repository: TrendingRepository;
    analysis: ReadmeAnalysis;
  },
  callbacks?: ThumbnailProgressCallbacks,
): Promise<{
  coverImage: string;
  subtitle: string;
  prompt: string;
  provider: ThumbnailProvider;
  model: string;
  attempts: ThumbnailAttempt[];
}> {
  const title = input.repository.name;
  const promptSpec = buildThumbnailPromptMessages({
    repository: input.repository,
    analysis: input.analysis,
    title,
  });

  callbacks?.onAttemptStart?.({
    index: 0,
    total: 1,
    provider: "openai",
    model: process.env.OPENAI_BLOG_WRITER_MODEL || "gpt-4.1",
    label: `openai:${process.env.OPENAI_BLOG_WRITER_MODEL || "gpt-4.1"}`,
  });

  const response = await llm.chat({
    messages: promptSpec.messages,
    temperature: 0.3,
    maxTokens: 500,
    metadata: {
      feature: "thumbnail-prompt",
      repo: input.repository.repoFullName,
      language: input.repository.language,
    },
  });

  const payload = parseJson<ThumbnailPromptPayload>(response.response.content);
  if (!payload.imagePrompt?.trim()) {
    throw new Error("Gateway returned invalid thumbnail prompt payload");
  }

  const attempts: ThumbnailAttempt[] = response.attempts.map((attempt) => ({
    provider: attempt.provider,
    model: attempt.model,
    label: `${attempt.provider}:${attempt.model}`,
    ok: attempt.status === "success",
    error:
      attempt.status === "failed" ? attempt.errorType || "unknown" : undefined,
  }));

  for (let index = 0; index < attempts.length; index += 1) {
    callbacks?.onAttemptComplete?.({
      index,
      total: attempts.length,
      ...attempts[index],
    });
  }

  const svg = createThumbnailSvg({
    title,
    subtitle: promptSpec.subtitle,
    repository: input.repository,
    visualCue: payload.visualCue,
    imagePrompt: payload.imagePrompt,
  });

  const fileName = `${slugify(input.repository.repoFullName)}.svg`;
  const thumbnailsDir = join(BLOG_DATA_DIR, "thumbnails");

  await mkdir(thumbnailsDir, { recursive: true });
  await writeFile(join(thumbnailsDir, fileName), svg, "utf8");

  return {
    coverImage: `/api/blog-data/thumbnails/${fileName}`,
    subtitle: promptSpec.subtitle,
    prompt: payload.imagePrompt,
    provider: response.response.provider,
    model: response.response.model,
    attempts,
  };
}
