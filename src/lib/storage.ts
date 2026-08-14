/**
 * localStorage access that cannot crash the app.
 *
 * Failure modes handled:
 *  - SSR / no `window`
 *  - Safari private mode, where touching localStorage itself throws
 *  - Corrupt JSON left behind by an older build
 *  - QuotaExceededError on write
 */

function getStore(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const store = window.localStorage;
    // Probe once: some browsers expose the object but throw on use.
    const probe = '__mmr_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

const store = getStore();

export const storageAvailable = store !== null;

export function readRaw(key: string): string | null {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeRaw(key: string, value: string): boolean {
  try {
    store?.setItem(key, value);
    return store !== null;
  } catch {
    // Quota exceeded, or storage disabled mid-session. Non-fatal.
    return false;
  }
}

export function removeRaw(key: string): void {
  try {
    store?.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Reads and revives a JSON value.
 * `revive` must return null for anything it does not recognise, so bad data
 * falls back instead of propagating a broken shape into React state.
 */
export function readJSON<T>(
  key: string,
  revive: (parsed: unknown) => T | null,
  fallback: T,
): T {
  const raw = readRaw(key);
  if (raw === null) return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback;
  }

  try {
    return revive(parsed) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    return writeRaw(key, JSON.stringify(value));
  } catch {
    // Circular structure, or BigInt in the payload.
    return false;
  }
}
