import type {
  GeneratedBlogDraft,
  ReadmeAnalysis,
  TrendingRepository,
} from "@/lib/blog-data";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const OPENAI_BLOG_WRITER_MODEL =
  process.env.OPENAI_BLOG_WRITER_MODEL ||
  process.env.OPENAI_BLOG_MODEL ||
  "gpt-4.1";
const GEMINI_BLOG_WRITER_MODEL =
  process.env.GEMINI_BLOG_WRITER_MODEL || "gemini-2.0-flash";
const OPENROUTER_BLOG_WRITER_MODEL =
  process.env.OPENROUTER_BLOG_WRITER_MODEL || "openai/gpt-4.1-mini";
const OPENROUTER_BLOG_WRITER_FALLBACK_MODEL =
  process.env.OPENROUTER_BLOG_WRITER_FALLBACK_MODEL || "openai/gpt-4.1-nano";
const DEFAULT_OPENROUTER_BLOG_WRITER_MODELS = [
  "openai/gpt-oss-120b:free",
  "qwen/qwen3-235b-a22b-thinking-2507",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "arcee-ai/trinity-large-preview:free",
  "z-ai/glm-4.5-air:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
];
const OPENROUTER_BLOG_WRITER_MAX_TOKENS = Number.parseInt(
  process.env.OPENROUTER_BLOG_WRITER_MAX_TOKENS || "1800",
  10
);

type WriterProvider = "openai" | "gemini" | "openrouter";
type WriterTarget = {
  provider: WriterProvider;
  model: string;
  label: string;
};

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
  onAttemptComplete?: (attempt: WriterAttempt & {
    index: number;
    total: number;
  }) => void;
};

function parseOpenRouterModelList(): string[] {
  const configuredList = process.env.OPENROUTER_BLOG_WRITER_MODELS
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (configuredList && configuredList.length > 0) {
    return Array.from(new Set(configuredList));
  }

  const legacyList = [
    OPENROUTER_BLOG_WRITER_MODEL,
    OPENROUTER_BLOG_WRITER_FALLBACK_MODEL,
    ...DEFAULT_OPENROUTER_BLOG_WRITER_MODELS,
  ]
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set(legacyList));
}

function getConfiguredWriterTargets(): WriterTarget[] {
  const targets: WriterTarget[] = [];

  if (process.env.OPENAI_API_KEY) {
    targets.push({
      provider: "openai",
      model: OPENAI_BLOG_WRITER_MODEL,
      label: `openai:${OPENAI_BLOG_WRITER_MODEL}`,
    });
  }
  if (process.env.GEMINI_API_KEY) {
    targets.push({
      provider: "gemini",
      model: GEMINI_BLOG_WRITER_MODEL,
      label: `gemini:${GEMINI_BLOG_WRITER_MODEL}`,
    });
  }
  if (process.env.OPENROUTER_API_KEY) {
    for (const model of parseOpenRouterModelList()) {
      targets.push({
        provider: "openrouter",
        model,
        label: `openrouter:${model}`,
      });
    }
  }

  if (targets.length === 0) {
    throw new Error(
      "No blog writer provider is configured. Set OPENAI_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY."
    );
  }

  return targets;
}

export function getConfiguredWriterTargetLabels(): string[] {
  return getConfiguredWriterTargets().map((target) => target.label);
}

function parseJson<T>(payload: string): T {
  const start = payload.indexOf("{");
  const end = payload.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain valid JSON");
  }

  return JSON.parse(payload.slice(start, end + 1)) as T;
}

function buildWriterPrompt(input: {
  repository: TrendingRepository;
  analysis: ReadmeAnalysis;
}): { system: string; user: string } {
  return {
    system:
      "You are a senior Vietnamese tech editor. Return only JSON with keys: title, summary, content, tags. Content must be valid Markdown in Vietnamese with sections: Giới thiệu, Các tính năng chính, Ứng dụng thực tế, Kết luận.",
    user: [
      `Repository: ${input.repository.repoFullName}`,
      `Repo URL: ${input.repository.repoUrl}`,
      `Description: ${input.repository.description || "N/A"}`,
      `Stars in trending period: ${input.repository.starsToday}`,
      `Language: ${input.repository.language}`,
      `Trending period: ${input.repository.trendingPeriod}`,
      `GitHub rank: ${input.repository.githubRank}`,
      "",
      "Structured README analysis from heuristic parser:",
      JSON.stringify(input.analysis, null, 2),
      "",
      "Write a Vietnamese tech blog article.",
      "Requirements:",
      "- Explain what the project does",
      "- Explain key features",
      "- Mention possible use cases",
      "- Keep the explanation simple for developers",
      "- Write it like a tech blog article",
      "- Do not invent unsupported claims",
      "- Mention when details are inferred from the README analysis",
      "",
      "Return JSON only.",
    ].join("\n"),
  };
}

async function generateWithOpenAi<T>(input: {
  model: string;
  temperature: number;
  system: string;
  user: string;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: input.model,
      temperature: input.temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  return parseJson<T>(content);
}

async function generateWithGemini<T>(input: {
  model: string;
  temperature: number;
  system: string;
  user: string;
}): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `${GEMINI_API_URL}/${input.model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: input.temperature,
          responseMimeType: "application/json",
        },
        systemInstruction: {
          parts: [{ text: input.system }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: input.user }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("Gemini returned empty content");
  }

  return parseJson<T>(content);
}

async function generateWithOpenRouter<T>(input: {
  model: string;
  temperature: number;
  system: string;
  user: string;
}): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "localai-vn",
    },
    body: JSON.stringify({
      model: input.model,
      temperature: input.temperature,
      max_tokens: Number.isFinite(OPENROUTER_BLOG_WRITER_MAX_TOKENS)
        ? OPENROUTER_BLOG_WRITER_MAX_TOKENS
        : 1800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter returned empty content");
  }

  return parseJson<T>(content);
}

async function generateWithProvider(
  target: WriterTarget,
  prompt: { system: string; user: string }
): Promise<GeneratedBlogDraft> {
  if (target.provider === "openai") {
    return generateWithOpenAi<GeneratedBlogDraft>({
      model: target.model,
      temperature: 0.4,
      ...prompt,
    });
  }

  if (target.provider === "gemini") {
    return generateWithGemini<GeneratedBlogDraft>({
      model: target.model,
      temperature: 0.4,
      ...prompt,
    });
  }

  return generateWithOpenRouter<GeneratedBlogDraft>({
    model: target.model,
    temperature: 0.4,
    ...prompt,
  });
}

export async function generateVietnameseBlogArticleDetailed(input: {
  repository: TrendingRepository;
  analysis: ReadmeAnalysis;
}, callbacks?: WriterProgressCallbacks): Promise<GeneratedBlogResult> {
  const prompt = buildWriterPrompt(input);
  const targets = getConfiguredWriterTargets();
  const attempts: WriterAttempt[] = [];

  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];
    callbacks?.onAttemptStart?.({
      index,
      total: targets.length,
      provider: target.provider,
      model: target.model,
      label: target.label,
    });

    try {
      const payload = await generateWithProvider(target, prompt);

      if (!payload.title?.trim() || !payload.summary?.trim() || !payload.content?.trim()) {
        throw new Error(`${target.label} returned incomplete content`);
      }

      attempts.push({
        provider: target.provider,
        model: target.model,
        label: target.label,
        ok: true,
      });
      callbacks?.onAttemptComplete?.({
        provider: target.provider,
        model: target.model,
        label: target.label,
        ok: true,
        index,
        total: targets.length,
      });

      return {
        draft: payload,
        provider: target.provider,
        model: target.model,
        attempts,
      };
    } catch (error) {
      attempts.push({
        provider: target.provider,
        model: target.model,
        label: target.label,
        ok: false,
        error: error instanceof Error ? error.message : "unknown",
      });
      callbacks?.onAttemptComplete?.({
        provider: target.provider,
        model: target.model,
        label: target.label,
        ok: false,
        error: error instanceof Error ? error.message : "unknown",
        index,
        total: targets.length,
      });
    }
  }

  throw new Error(
    `All writer providers failed: ${attempts
      .map((attempt) =>
        attempt.ok
          ? `${attempt.label}:ok`
          : `${attempt.label}:${attempt.error || "unknown"}`
      )
      .join(" | ")}`
  );
}

export async function generateVietnameseBlogArticle(input: {
  repository: TrendingRepository;
  analysis: ReadmeAnalysis;
}): Promise<GeneratedBlogDraft> {
  const result = await generateVietnameseBlogArticleDetailed(input);
  return result.draft;
}
