import "server-only";

import {
  InvalidResponseError,
  NetworkError,
  ProviderError,
  RateLimitError,
} from "@/lib/llm/errors";
import { logEvent } from "@/lib/llm/logger";
import type {
  OpenRouterFreeModelCandidate,
  OpenRouterModel,
  ProviderConfig,
} from "@/lib/llm/types";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const FREE_MODEL_CACHE_TTL_MS = 10 * 60 * 1000;

type CachedFreeModels = {
  expiresAt: number;
  candidates: OpenRouterFreeModelCandidate[];
};

let freeModelsCache: CachedFreeModels | null = null;

function parsePrice(value: number | string | undefined): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }
  return Number.NaN;
}

function toCandidate(model: OpenRouterModel): OpenRouterFreeModelCandidate {
  return {
    id: model.id,
    contextLength: model.context_length ?? 0,
    tokenLimit: model.top_provider?.max_completion_tokens ?? 0,
    latency: model.top_provider?.latency ?? Number.MAX_SAFE_INTEGER,
  };
}

function rankCandidates(
  models: OpenRouterModel[],
): OpenRouterFreeModelCandidate[] {
  const free = models
    .filter((model) => parsePrice(model.pricing?.prompt) === 0)
    .filter((model) => parsePrice(model.pricing?.completion) === 0)
    .map(toCandidate)
    .sort((a, b) => {
      if (b.contextLength !== a.contextLength) {
        return b.contextLength - a.contextLength;
      }
      if (b.tokenLimit !== a.tokenLimit) {
        return b.tokenLimit - a.tokenLimit;
      }
      return a.latency - b.latency;
    });

  return free;
}

export function clearOpenRouterFreeModelCache(): void {
  freeModelsCache = null;
}

export async function getRankedOpenRouterFreeModels(input: {
  requestId: string;
  config: NonNullable<ProviderConfig["openrouter"]>;
}): Promise<OpenRouterFreeModelCandidate[]> {
  if (freeModelsCache && Date.now() < freeModelsCache.expiresAt) {
    return freeModelsCache.candidates;
  }

  let response: Response;
  try {
    response = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${input.config.apiKey}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    throw new NetworkError("Failed to fetch OpenRouter models", error);
  }

  if (!response.ok) {
    const detail = await response.text();
    if (response.status === 429) {
      throw new RateLimitError(
        `OpenRouter models rate limited: ${detail}`,
        response.status,
      );
    }
    throw new ProviderError(
      `OpenRouter models discovery failed: ${response.status} ${detail}`,
      response.status,
    );
  }

  const payload = (await response.json()) as {
    data?: OpenRouterModel[];
  };

  if (!Array.isArray(payload.data)) {
    throw new InvalidResponseError(
      "OpenRouter models API returned invalid data",
    );
  }

  const candidates = rankCandidates(payload.data);
  if (candidates.length === 0) {
    throw new InvalidResponseError(
      "OpenRouter models API returned no free models",
    );
  }

  freeModelsCache = {
    candidates,
    expiresAt: Date.now() + FREE_MODEL_CACHE_TTL_MS,
  };

  logEvent({
    event: "LLM_OPENROUTER_FREE_MODEL_SELECTED",
    requestId: input.requestId,
    provider: "openrouter",
    model: candidates[0].id,
    retryCount: 0,
    fallbackTriggered: true,
    status: "success",
    metadata: {
      contextLength: candidates[0].contextLength,
      tokenLimit: candidates[0].tokenLimit,
      latency: candidates[0].latency,
      cacheTtlMs: FREE_MODEL_CACHE_TTL_MS,
    },
  });

  return candidates;
}
