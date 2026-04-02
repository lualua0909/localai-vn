import "server-only";

import { routeChatRequest } from "@/lib/llm/router";
import { loadProviderConfigFromEnv } from "@/lib/llm/providers";
import type {
  ChatRequest,
  ChatResponse,
  ProviderAttempt,
} from "@/lib/llm/types";

export type LlmGatewayResponse = {
  response: ChatResponse;
  requestId: string;
  attempts: ProviderAttempt[];
};

function createRequestId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `llm_${Date.now()}_${random}`;
}

async function chat(request: ChatRequest): Promise<LlmGatewayResponse> {
  if (!Array.isArray(request.messages) || request.messages.length === 0) {
    throw new Error("llm.chat requires at least one message");
  }

  const requestId = createRequestId();
  const config = loadProviderConfigFromEnv();
  const routed = await routeChatRequest({
    requestId,
    request,
    config,
  });

  return {
    requestId,
    response: routed.response,
    attempts: routed.attempts,
  };
}

export const llm = {
  chat,
};

export type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  LlmProvider,
} from "@/lib/llm/types";
