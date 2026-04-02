import "server-only";

export type LlmErrorOptions = {
  retryable: boolean;
  fallbackable: boolean;
  statusCode?: number;
  cause?: unknown;
};

export class LlmError extends Error {
  public readonly retryable: boolean;
  public readonly fallbackable: boolean;
  public readonly statusCode?: number;

  constructor(message: string, options: LlmErrorOptions) {
    super(message);
    this.name = "LlmError";
    this.retryable = options.retryable;
    this.fallbackable = options.fallbackable;
    this.statusCode = options.statusCode;
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export class RateLimitError extends LlmError {
  constructor(message: string, statusCode?: number, cause?: unknown) {
    super(message, {
      retryable: true,
      fallbackable: true,
      statusCode,
      cause,
    });
    this.name = "RateLimitError";
  }
}

export class TimeoutError extends LlmError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      retryable: true,
      fallbackable: true,
      cause,
    });
    this.name = "TimeoutError";
  }
}

export class ProviderError extends LlmError {
  constructor(message: string, statusCode?: number, cause?: unknown) {
    const retryable = statusCode === undefined || statusCode >= 500;
    super(message, {
      retryable,
      fallbackable: true,
      statusCode,
      cause,
    });
    this.name = "ProviderError";
  }
}

export class NetworkError extends LlmError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      retryable: true,
      fallbackable: true,
      cause,
    });
    this.name = "NetworkError";
  }
}

export class InvalidResponseError extends LlmError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      retryable: false,
      fallbackable: true,
      cause,
    });
    this.name = "InvalidResponseError";
  }
}

export function getErrorType(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }
  return "UnknownError";
}

export function toLlmError(error: unknown): LlmError {
  if (error instanceof LlmError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new TimeoutError("Request timed out", error);
  }

  if (error instanceof TypeError) {
    return new NetworkError(error.message || "Network failure", error);
  }

  if (error instanceof Error) {
    return new ProviderError(error.message, undefined, error);
  }

  return new ProviderError("Unexpected provider error");
}
