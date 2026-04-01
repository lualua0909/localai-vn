import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import type { ReadmeAnalysis, TrendingRepository } from "@/lib/blog-data";
import { slugify } from "@/lib/blog-data";

const BLOG_DATA_DIR = join(process.cwd(), "blog-data");
const OPENAI_IMAGES_API_URL = "https://api.openai.com/v1/images/generations";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const OPENAI_THUMBNAIL_MODEL =
  process.env.OPENAI_THUMBNAIL_MODEL || "gpt-image-1";
const GEMINI_THUMBNAIL_MODEL =
  process.env.GEMINI_THUMBNAIL_MODEL || "gemini-2.0-flash-preview-image-generation";

type ThumbnailProvider = "openai" | "gemini";
type ThumbnailTarget = {
  provider: ThumbnailProvider;
  model: string;
  label: string;
};

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
  onAttemptComplete?: (attempt: ThumbnailAttempt & {
    index: number;
    total: number;
  }) => void;
};

const LANGUAGE_BRANDS: Record<string, { gradient: string; accent: string }> = {
  go: { gradient: "cyan to teal", accent: "#00ADD8" },
  rust: { gradient: "burnt orange to copper", accent: "#CE422B" },
  python: { gradient: "golden yellow to electric blue", accent: "#3776AB" },
  typescript: { gradient: "azure blue to indigo", accent: "#3178C6" },
  javascript: { gradient: "yellow to amber", accent: "#F7DF1E" },
  java: { gradient: "red orange to deep slate", accent: "#F89820" },
  csharp: { gradient: "violet to royal blue", accent: "#512BD4" },
  ruby: { gradient: "crimson to warm pink", accent: "#CC342D" },
  php: { gradient: "indigo to steel blue", accent: "#777BB4" },
  swift: { gradient: "orange to coral", accent: "#FA7343" },
  kotlin: { gradient: "purple to orange", accent: "#7F52FF" },
  default: { gradient: "slate gray to graphite", accent: "#94A3B8" },
};

function getThumbnailTargets(): ThumbnailTarget[] {
  const providers: ThumbnailTarget[] = [];
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      provider: "openai",
      model: OPENAI_THUMBNAIL_MODEL,
      label: `openai:${OPENAI_THUMBNAIL_MODEL}`,
    });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({
      provider: "gemini",
      model: GEMINI_THUMBNAIL_MODEL,
      label: `gemini:${GEMINI_THUMBNAIL_MODEL}`,
    });
  }
  return providers;
}

export function getConfiguredThumbnailTargetLabels(): string[] {
  return getThumbnailTargets().map((target) => target.label);
}

function getLanguageBrand(language: string) {
  const key = language.toLowerCase();
  return LANGUAGE_BRANDS[key] || LANGUAGE_BRANDS.default;
}

function titleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function buildSubtitle(repository: TrendingRepository, analysis: ReadmeAnalysis): string {
  const description =
    repository.description ||
    analysis.projectDescription ||
    analysis.mainFeatures[0] ||
    `${repository.language} developer tool`;

  const cleaned = description
    .replace(/\.$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);

  return titleCase(cleaned || `${repository.language} Open Source Tool`);
}

function buildVisualCue(repository: TrendingRepository, analysis: ReadmeAnalysis): string {
  return (
    analysis.visualCue ||
    analysis.logoAlt ||
    analysis.mainFeatures[0] ||
    analysis.useCases[0] ||
    repository.language
  );
}

function buildThumbnailPrompt(input: {
  repository: TrendingRepository;
  analysis: ReadmeAnalysis;
  title: string;
  subtitle: string;
}) {
  const brand = getLanguageBrand(input.repository.language);
  const visualCue = buildVisualCue(input.repository, input.analysis);
  const logoHint = input.analysis.logoUrl
    ? `Detected README logo cue: ${input.analysis.logoAlt || input.analysis.logoUrl}.`
    : "No explicit logo asset detected; create a custom geometric product icon.";

  return [
    "Use case: ui-mockup",
    "Asset type: YouTube-style tech blog thumbnail",
    "Primary request: create a modern, premium, minimal tech thumbnail for an open-source repository article",
    "Style/medium: clean editorial thumbnail, startup-quality, sharp typography, subtle depth, no clutter",
    "Composition/framing: widescreen 16:9 cover, centered or slightly left-aligned bold repo title, small subtitle beneath, one elegant visual icon, large negative space",
    `Color palette: gradient background ${brand.gradient}, with accent ${brand.accent}`,
    "Lighting/mood: futuristic, crisp, polished, modern, minimal",
    `Subject: repository ${input.repository.repoFullName}`,
    `Text (verbatim): "${input.title}" and "${input.subtitle}"`,
    `Scene/backdrop: abstract gradient field inspired by ${input.repository.language}`,
    `Constraints: modern simple layout, no screenshot UI, no watermark, no extra text, no busy patterns, must feel like a top tech company blog cover`,
    `Materials/textures: soft glow, glassmorphism hints, subtle grain, thin grid lines`,
    `Supporting visual cue: ${visualCue}`,
    logoHint,
  ].join("\n");
}

async function generateWithOpenAi(prompt: string): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch(OPENAI_IMAGES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_THUMBNAIL_MODEL,
      prompt,
      size: "1536x1024",
      quality: "medium",
      output_format: "png",
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI thumbnail failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as {
    data?: Array<{ b64_json?: string }>;
  };
  const base64 = data.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error("OpenAI thumbnail returned no image");
  }

  return Buffer.from(base64, "base64");
}

async function generateWithGemini(prompt: string): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `${GEMINI_API_URL}/${GEMINI_THUMBNAIL_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini thumbnail failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: {
            data?: string;
            mimeType?: string;
          };
        }>;
      };
    }>;
  };

  const base64 = data.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)
    ?.inlineData?.data;

  if (!base64) {
    throw new Error("Gemini thumbnail returned no image");
  }

  return Buffer.from(base64, "base64");
}

async function generateThumbnailBuffer(
  prompt: string,
  callbacks?: ThumbnailProgressCallbacks
): Promise<{ buffer: Buffer; attempts: ThumbnailAttempt[]; provider: ThumbnailProvider; model: string }> {
  const providers = getThumbnailTargets();
  const errors: string[] = [];
  const attempts: ThumbnailAttempt[] = [];

  for (let index = 0; index < providers.length; index += 1) {
    const provider = providers[index];
    callbacks?.onAttemptStart?.({
      index,
      total: providers.length,
      provider: provider.provider,
      model: provider.model,
      label: provider.label,
    });

    try {
      const buffer =
        provider.provider === "openai"
          ? await generateWithOpenAi(prompt)
          : await generateWithGemini(prompt);

      attempts.push({
        provider: provider.provider,
        model: provider.model,
        label: provider.label,
        ok: true,
      });
      callbacks?.onAttemptComplete?.({
        provider: provider.provider,
        model: provider.model,
        label: provider.label,
        ok: true,
        index,
        total: providers.length,
      });

      return {
        buffer,
        attempts,
        provider: provider.provider,
        model: provider.model,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "unknown";
      errors.push(`${provider.provider}:${message}`);
      attempts.push({
        provider: provider.provider,
        model: provider.model,
        label: provider.label,
        ok: false,
        error: message,
      });
      callbacks?.onAttemptComplete?.({
        provider: provider.provider,
        model: provider.model,
        label: provider.label,
        ok: false,
        error: message,
        index,
        total: providers.length,
      });
    }
  }

  throw new Error(`Thumbnail providers failed: ${errors.join(" | ")}`);
}

export async function generateBlogThumbnail(input: {
  repository: TrendingRepository;
  analysis: ReadmeAnalysis;
}, callbacks?: ThumbnailProgressCallbacks): Promise<{
  coverImage: string;
  subtitle: string;
  prompt: string;
  provider: ThumbnailProvider;
  model: string;
  attempts: ThumbnailAttempt[];
}> {
  const title = input.repository.name;
  const subtitle = buildSubtitle(input.repository, input.analysis);
  const prompt = buildThumbnailPrompt({
    repository: input.repository,
    analysis: input.analysis,
    title,
    subtitle,
  });

  const generation = await generateThumbnailBuffer(prompt, callbacks);
  const fileName = `${slugify(input.repository.repoFullName)}.png`;
  const thumbnailsDir = join(BLOG_DATA_DIR, "thumbnails");

  await mkdir(thumbnailsDir, { recursive: true });
  await writeFile(join(thumbnailsDir, fileName), generation.buffer);

  return {
    coverImage: `/api/blog-data/thumbnails/${fileName}`,
    subtitle,
    prompt,
    provider: generation.provider,
    model: generation.model,
    attempts: generation.attempts,
  };
}
