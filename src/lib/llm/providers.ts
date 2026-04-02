import "server-only";

import {
  InvalidResponseError,
  ProviderError,
  RateLimitError,
  TimeoutError,
} from "@/lib/llm/errors";
import type {
  ChatRequest,
  ChatResponse,
  LlmProvider,
  ProviderConfig,
} from "@/lib/llm/types";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_MODEL_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

function parseStatusError(status: number, message: string) {
  if (status === 429) {
    return new RateLimitError(message, status);
  }

  if (status === 408 || status === 504) {
    return new TimeoutError(message);
  }

  return new ProviderError(message, status);
}

async function parseErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 800);
  } catch {
    return "failed to read error body";
  }
}

async function fetchJsonWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await parseErrorBody(response);
      throw parseStatusError(
        response.status,
        `HTTP ${response.status} from provider: ${detail}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new TimeoutError(`Provider timeout after ${timeoutMs}ms`, error);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function ensureTextContent(value: unknown, provider: LlmProvider): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new InvalidResponseError(`${provider} returned empty content`);
  }
  return value;
}

export function loadProviderConfigFromEnv(): ProviderConfig {
  const config: ProviderConfig = {};

  if (process.env.OPENAI_API_KEY) {
    config.openai = {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_BLOG_WRITER_MODEL || "gpt-4.1",
    };
  }

  if (process.env.GEMINI_API_KEY) {
    config.gemini = {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_BLOG_WRITER_MODEL || "gemini-2.0-flash",
    };
  }

  if (process.env.OPENROUTER_API_KEY) {
    config.openrouter = {
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultModel: process.env.OPENROUTER_BLOG_WRITER_MODEL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      appName: process.env.OPENROUTER_APP_NAME || "localai-vn",
    };
  }

  return config;
}

export async function callOpenAI(input: {
  config: NonNullable<ProviderConfig["openai"]>;
  request: ChatRequest;
  modelOverride?: string;
}): Promise<Omit<ChatResponse, "provider" | "latencyMs">> {
  const model = input.modelOverride || input.config.model;

  const data = (await fetchJsonWithTimeout(
    OPENAI_CHAT_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: input.request.temperature ?? 0.3,
        max_tokens: input.request.maxTokens,
        messages: input.request.messages,
      }),
    },
    input.request.timeoutMs ?? 25000,
  )) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };

  const content = ensureTextContent(
    data.choices?.[0]?.message?.content,
    "openai",
  );

  return {
    content,
    model,
    usage: {
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
    },
  };
}

export async function callGemini(input: {
  config: NonNullable<ProviderConfig["gemini"]>;
  request: ChatRequest;
  modelOverride?: string;
}): Promise<Omit<ChatResponse, "provider" | "latencyMs">> {
  const model = input.modelOverride || input.config.model;

  const data = (await fetchJsonWithTimeout(
    `${GEMINI_MODEL_URL}/${model}:generateContent?key=${input.config.apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: input.request.temperature ?? 0.3,
          maxOutputTokens: input.request.maxTokens,
        },
        contents: input.request.messages
          .filter((message) => message.role !== "system")
          .map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
        systemInstruction: {
          parts: input.request.messages
            .filter((message) => message.role === "system")
            .map((message) => ({ text: message.content })),
        },
      }),
    },
    input.request.timeoutMs ?? 25000,
  )) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };
  };

  const content = ensureTextContent(
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n"),
    "gemini",
  );

  return {
    content,
    model,
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount,
      completionTokens: data.usageMetadata?.candidatesTokenCount,
      totalTokens: data.usageMetadata?.totalTokenCount,
    },
  };
}

export async function callOpenRouter(input: {
  config: NonNullable<ProviderConfig["openrouter"]>;
  request: ChatRequest;
  model: string;
}): Promise<Omit<ChatResponse, "provider" | "latencyMs">> {
  const data = (await fetchJsonWithTimeout(
    OPENROUTER_CHAT_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.config.apiKey}`,
        "HTTP-Referer": input.config.appUrl || "http://localhost:3000",
        "X-Title": input.config.appName || "localai-vn",
      },
      body: JSON.stringify({
        model: input.model,
        temperature: input.request.temperature ?? 0.3,
        max_tokens: input.request.maxTokens,
        messages: input.request.messages,
      }),
    },
    input.request.timeoutMs ?? 30000,
  )) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };

  const content = ensureTextContent(
    data.choices?.[0]?.message?.content,
    "openrouter",
  );

  return {
    content,
    model: input.model,
    usage: {
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
    },
  };
}
