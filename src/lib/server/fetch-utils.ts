const DEFAULT_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function rateLimitedMap<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  delayMs: number
): Promise<R[]> {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += 1) {
    if (index > 0 && delayMs > 0) {
      await sleep(delayMs);
    }
    results.push(await mapper(items[index], index));
  }
  return results;
}

export async function fetchWithRetry(
  input: string | URL,
  init: RequestInit = {},
  retries = DEFAULT_RETRIES
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(input, {
        ...init,
        next: {
          revalidate: 60 * 60,
          ...(init.next ?? {}),
        },
      });

      if (response.ok) {
        return response;
      }

      if (response.status < 500 && response.status !== 429) {
        return response;
      }

      lastError = new Error(`Request failed with status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      await sleep(500 * attempt);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Request failed after retries");
}
