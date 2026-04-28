// Simple in-memory rate limiter. Resets on server restart (acceptable for MVP).
// Key → array of timestamps of recent requests.
const store = new Map<string, number[]>();

export const AI_MAX_REQUESTS = 10;
export const AI_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const timestamps = (store.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    return { allowed: false, retryAfterMs: windowMs - (now - oldest) };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true, retryAfterMs: 0 };
}

export function getRateLimitStatus(key: string): { used: number; remaining: number; resetInMs: number } {
  const now = Date.now();
  const timestamps = (store.get(key) ?? []).filter((t) => now - t < AI_WINDOW_MS);
  const used = timestamps.length;
  const remaining = Math.max(0, AI_MAX_REQUESTS - used);
  const resetInMs = timestamps.length > 0 ? AI_WINDOW_MS - (now - timestamps[0]) : AI_WINDOW_MS;
  return { used, remaining, resetInMs };
}
