interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // per window

export function rateLimit(key: string): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = store.get(key);
  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, reset: now + WINDOW_MS };
  }
  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, reset: record.resetTime };
  }
  record.count++;
  store.set(key, record);
  return { allowed: true, remaining: MAX_REQUESTS - record.count, reset: record.resetTime };
}