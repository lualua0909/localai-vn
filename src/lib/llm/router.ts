import "server-only";

import { getErrorType, toLlmError } from "@/lib/llm/errors";
import { logEvent } from "@/lib/llm/logger";
import {
  getBlogWriterModels,
  getRankedOpenRouterFreeModels,
} from "@/lib/llm/openrouter";
import { callGemini, callOpenAI, callOpenRouter } from "@/lib/llm/providers";
import { withRetry } from "@/lib/llm/retry";
import type {
  ChatRequest,
  ChatResponse,
  LlmProvider,
  ProviderConfig,
  ProviderAttempt,
} from "@/lib/llm/types";

type ProviderStage = {
  provider: LlmProvider;
};

type RouteResult = {
  response: ChatResponse;
  attempts: ProviderAttempt[];
};

function getRequestFeature(request: ChatRequest): string {
  const feature = request.metadata?.feature;
  return typeof feature === "string" ? feature : "unknown";
}

function nowMs() {
  return Date.now();
}

function getProviderStages(config: ProviderConfig): ProviderStage[] {
  const stages: ProviderStage[] = [];

  if (config.openai?.apiKey) {
    stages.push({ provider: "openai" });
  }
  if (config.gemini?.apiKey) {
    stages.push({ provider: "gemini" });
  }
  if (config.openrouter?.apiKey) {
    stages.push({ provider: "openrouter" });
  }

  return stages;
}

async function runOpenAiStage(input: {
  requestId: string;
  request: ChatRequest;
  config: NonNullable<ProviderConfig["openai"]>;
}) {
  const startedAt = nowMs();
  const model = input.config.model;

  const result = await withRetry({
    requestId: input.requestId,
    context: {
      provider: "openai",
      model,
      attempt: 1,
    },
    run: async () =>
      callOpenAI({
        config: input.config,
        request: input.request,
      }),
  });

  return {
    response: {
      ...result.value,
      provider: "openai" as const,
      latencyMs: nowMs() - startedAt,
    },
    retries: result.retries,
  };
}

async function runGeminiStage(input: {
  requestId: string;
  request: ChatRequest;
  config: NonNullable<ProviderConfig["gemini"]>;
}) {
  const startedAt = nowMs();
  const model = input.config.model;

  const result = await withRetry({
    requestId: input.requestId,
    context: {
      provider: "gemini",
      model,
      attempt: 1,
    },
    run: async () =>
      callGemini({
        config: input.config,
        request: input.request,
      }),
  });

  return {
    response: {
      ...result.value,
      provider: "gemini" as const,
      latencyMs: nowMs() - startedAt,
    },
    retries: result.retries,
  };
}

async function runOpenRouterStage(input: {
  requestId: string;
  request: ChatRequest;
  config: NonNullable<ProviderConfig["openrouter"]>;
}) {
  const startedAt = nowMs();
  const feature = getRequestFeature(input.request);
  const isBlogWriter = feature === "blog_writer";

  let resolvedQueue: Array<{ id: string }>;
  if (isBlogWriter) {
    resolvedQueue = getBlogWriterModels().map((id) => ({ id }));
  } else {
    const discovered = await getRankedOpenRouterFreeModels({
      requestId: input.requestId,
      config: input.config,
    });
    const dynamicQueue = [...discovered];
    if (
      input.config.defaultModel &&
      !dynamicQueue.some((item) => item.id === input.config.defaultModel)
    ) {
      dynamicQueue.push({
        id: input.config.defaultModel,
        contextLength: 0,
        tokenLimit: 0,
        latency: Number.MAX_SAFE_INTEGER,
      });
    }
    resolvedQueue = dynamicQueue.map((item) => ({ id: item.id }));
  }

  let lastError: unknown = new Error("OpenRouter stage failed");

  for (let index = 0; index < resolvedQueue.length; index += 1) {
    const candidate = resolvedQueue[index];
    const attemptNumber = index + 1;
    const candidateStartedAt = nowMs();

    if (isBlogWriter) {
      logEvent({
        event: "LLM_OPENROUTER_MODEL_ATTEMPT",
        requestId: input.requestId,
        feature: "blog_writer",
        provider: "openrouter",
        model: candidate.id,
        attempt_number: attemptNumber,
        latency: 0,
        status: "started",
      });
    }

    try {
      const result = await withRetry({
        requestId: input.requestId,
        context: {
          provider: "openrouter",
          model: candidate.id,
          attempt: 1,
        },
        run: async () =>
          callOpenRouter({
            config: input.config,
            request: input.request,
            model: candidate.id,
          }),
      });

      if (isBlogWriter) {
        logEvent({
          event: "LLM_OPENROUTER_MODEL_SUCCESS",
          requestId: input.requestId,
          feature: "blog_writer",
          provider: "openrouter",
          model: candidate.id,
          attempt_number: attemptNumber,
          latency: nowMs() - candidateStartedAt,
          status: "success",
        });
      }

      return {
        response: {
          ...result.value,
          provider: "openrouter" as const,
          latencyMs: nowMs() - startedAt,
        },
        retries: result.retries,
      };
    } catch (error) {
      lastError = error;
      const retryCount = (error as { retryCount?: number }).retryCount ?? 3;

      if (isBlogWriter) {
        logEvent({
          event: "LLM_OPENROUTER_MODEL_FAILED",
          requestId: input.requestId,
          feature: "blog_writer",
          provider: "openrouter",
          model: candidate.id,
          attempt_number: attemptNumber,
          latency: nowMs() - candidateStartedAt,
          status: "failed",
          errorType: getErrorType(error),
          error_message:
            error instanceof Error ? error.message : "OpenRouter model failed",
        });
      }

      logEvent({
        event: "LLM_PROVIDER_FAILED",
        requestId: input.requestId,
        provider: "openrouter",
        model: candidate.id,
        retryCount,
        fallbackTriggered: true,
        latency: nowMs() - startedAt,
        status: "failed",
        errorType: getErrorType(error),
      });
    }
  }

  if (isBlogWriter) {
    logEvent({
      event: "LLM_OPENROUTER_ALL_MODELS_FAILED",
      requestId: input.requestId,
      feature: "blog_writer",
      provider: "openrouter",
      model: resolvedQueue[resolvedQueue.length - 1]?.id,
      attempt_number: resolvedQueue.length,
      latency: nowMs() - startedAt,
      status: "failed",
      error_message:
        lastError instanceof Error
          ? lastError.message
          : "All blog writer OpenRouter models failed",
      errorType: getErrorType(lastError),
    });
  }

  throw lastError;
}

function buildProviderAttempt(input: {
  provider: LlmProvider;
  model: string;
  retries: number;
  fallbackTriggered: boolean;
  latencyMs: number;
  status: "success" | "failed";
  errorType?: string;
}): ProviderAttempt {
  return {
    provider: input.provider,
    model: input.model,
    retryCount: input.retries,
    fallbackTriggered: input.fallbackTriggered,
    latencyMs: input.latencyMs,
    status: input.status,
    errorType: input.errorType,
  };
}

export async function routeChatRequest(input: {
  requestId: string;
  request: ChatRequest;
  config: ProviderConfig;
}): Promise<RouteResult> {
  const stages = getProviderStages(input.config);

  if (stages.length === 0) {
    throw new Error(
      "No LLM providers are configured. Add OPENAI_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY.",
    );
  }

  const attempts: ProviderAttempt[] = [];

  logEvent({
    event: "LLM_REQUEST_STARTED",
    requestId: input.requestId,
    retryCount: 0,
    fallbackTriggered: false,
    status: "started",
    metadata: input.request.metadata,
  });

  for (let index = 0; index < stages.length; index += 1) {
    const stage = stages[index];
    const fallbackTriggered = index > 0;

    if (fallbackTriggered) {
      logEvent({
        event: "LLM_FALLBACK_TRIGGERED",
        requestId: input.requestId,
        provider: stage.provider,
        retryCount: 0,
        fallbackTriggered: true,
        status: "started",
      });
    }

    const stageStartedAt = nowMs();

    try {
      if (stage.provider === "openai" && input.config.openai) {
        const outcome = await runOpenAiStage({
          requestId: input.requestId,
          request: input.request,
          config: input.config.openai,
        });

        attempts.push(
          buildProviderAttempt({
            provider: "openai",
            model: outcome.response.model,
            retries: outcome.retries,
            fallbackTriggered,
            latencyMs: outcome.response.latencyMs,
            status: "success",
          }),
        );

        logEvent({
          event: "LLM_REQUEST_SUCCESS",
          requestId: input.requestId,
          provider: "openai",
          model: outcome.response.model,
          retryCount: outcome.retries,
          fallbackTriggered,
          latency: outcome.response.latencyMs,
          status: "success",
        });

        return {
          response: outcome.response,
          attempts,
        };
      }

      if (stage.provider === "gemini" && input.config.gemini) {
        const outcome = await runGeminiStage({
          requestId: input.requestId,
          request: input.request,
          config: input.config.gemini,
        });

        attempts.push(
          buildProviderAttempt({
            provider: "gemini",
            model: outcome.response.model,
            retries: outcome.retries,
            fallbackTriggered,
            latencyMs: outcome.response.latencyMs,
            status: "success",
          }),
        );

        logEvent({
          event: "LLM_REQUEST_SUCCESS",
          requestId: input.requestId,
          provider: "gemini",
          model: outcome.response.model,
          retryCount: outcome.retries,
          fallbackTriggered,
          latency: outcome.response.latencyMs,
          status: "success",
        });

        return {
          response: outcome.response,
          attempts,
        };
      }

      if (stage.provider === "openrouter" && input.config.openrouter) {
        const outcome = await runOpenRouterStage({
          requestId: input.requestId,
          request: input.request,
          config: input.config.openrouter,
        });

        attempts.push(
          buildProviderAttempt({
            provider: "openrouter",
            model: outcome.response.model,
            retries: outcome.retries,
            fallbackTriggered,
            latencyMs: outcome.response.latencyMs,
            status: "success",
          }),
        );

        logEvent({
          event: "LLM_REQUEST_SUCCESS",
          requestId: input.requestId,
          provider: "openrouter",
          model: outcome.response.model,
          retryCount: outcome.retries,
          fallbackTriggered,
          latency: outcome.response.latencyMs,
          status: "success",
        });

        return {
          response: outcome.response,
          attempts,
        };
      }
    } catch (error) {
      const normalized = toLlmError(error);
      const errorType = getErrorType(normalized);
      const retryCount = (error as { retryCount?: number }).retryCount ?? 3;

      attempts.push(
        buildProviderAttempt({
          provider: stage.provider,
          model:
            stage.provider === "openai"
              ? input.config.openai?.model || "unknown"
              : stage.provider === "gemini"
                ? input.config.gemini?.model || "unknown"
                : input.config.openrouter?.defaultModel || "auto-free",
          retries: retryCount,
          fallbackTriggered,
          latencyMs: nowMs() - stageStartedAt,
          status: "failed",
          errorType,
        }),
      );

      logEvent({
        event: "LLM_PROVIDER_FAILED",
        requestId: input.requestId,
        provider: stage.provider,
        model: attempts[attempts.length - 1].model,
        retryCount,
        fallbackTriggered,
        latency: nowMs() - stageStartedAt,
        status: "failed",
        errorType,
      });

      const isLastProvider = index === stages.length - 1;
      if (!normalized.fallbackable || isLastProvider) {
        throw normalized;
      }
    }
  }

  throw new Error("Routing finished without a provider response");
}
