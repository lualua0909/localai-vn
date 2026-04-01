const LOCK_KEY = "__localai_blog_generation_lock__";
const DEFAULT_COOLDOWN_MS = 60 * 1000;

type BlogGenerationLockState = {
  running: boolean;
  lastStartedAt?: number;
};

function getLockState(): BlogGenerationLockState {
  const globalStore = globalThis as typeof globalThis & {
    [LOCK_KEY]?: BlogGenerationLockState;
  };

  if (!globalStore[LOCK_KEY]) {
    globalStore[LOCK_KEY] = { running: false };
  }

  return globalStore[LOCK_KEY]!;
}

export function acquireBlogGenerationLock(cooldownMs = DEFAULT_COOLDOWN_MS) {
  const state = getLockState();
  const now = Date.now();

  if (state.running) {
    return {
      ok: false as const,
      reason: "A blog generation job is already running.",
    };
  }

  if (state.lastStartedAt && now - state.lastStartedAt < cooldownMs) {
    return {
      ok: false as const,
      reason: "Please wait a bit before starting another generation job.",
    };
  }

  state.running = true;
  state.lastStartedAt = now;

  return {
    ok: true as const,
    release: () => {
      state.running = false;
    },
  };
}
