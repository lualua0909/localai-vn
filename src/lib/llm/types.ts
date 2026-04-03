import "server-only";

export type LlmProvider = "openai" | "gemini" | "openrouter";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
  requestId?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  metadata?: Record<string, string | number | boolean | null>;
};

export type ChatResponse = {
  content: string;
  provider: LlmProvider;
  model: string;
  latencyMs: number;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

export type ProviderConfig = {
  openai?: {
    apiKey: string;
    model: string;
  };
  gemini?: {
    apiKey: string;
    model: string;
  };
  openrouter?: {
    apiKey: string;
    defaultModel?: string;
    appUrl?: string;
    appName?: string;
  };
};

export type RetryPolicy = {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterMs: number;
};

export type RetryContext = {
  provider: LlmProvider;
  model: string;
  attempt: number;
};

export type RetryResult<T> = {
  value: T;
  retries: number;
};

export type ProviderAttempt = {
  provider: LlmProvider;
  model: string;
  retryCount: number;
  fallbackTriggered: boolean;
  latencyMs: number;
  status: "success" | "failed";
  errorType?: string;
};

export type LogEventName =
  | "LLM_REQUEST_STARTED"
  | "LLM_REQUEST_SUCCESS"
  | "LLM_RETRY_ATTEMPT"
  | "LLM_PROVIDER_FAILED"
  | "LLM_FALLBACK_TRIGGERED"
  | "LLM_OPENROUTER_FREE_MODEL_SELECTED"
  | "LLM_OPENROUTER_MODEL_ATTEMPT"
  | "LLM_OPENROUTER_MODEL_FAILED"
  | "LLM_OPENROUTER_MODEL_SUCCESS"
  | "LLM_OPENROUTER_ALL_MODELS_FAILED";

export type LogEvent = {
  event: LogEventName;
  timestamp: string;
  provider?: LlmProvider;
  model?: string;
  retryCount?: number;
  fallbackTriggered?: boolean;
  latency?: number;
  status?: "success" | "failed" | "started";
  errorType?: string;
  feature?: string;
  attempt_number?: number;
  error_message?: string;
  requestId: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type OpenRouterModel = {
  id: string;
  context_length?: number;
  top_provider?: {
    max_completion_tokens?: number;
    latency?: number;
  };
  pricing?: {
    prompt?: number | string;
    completion?: number | string;
  };
};

export type OpenRouterFreeModelCandidate = {
  id: string;
  contextLength: number;
  tokenLimit: number;
  latency: number;
};
