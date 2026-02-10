type RateEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateEntry>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  store.set(key, entry);
  return { allowed: true, remaining: limit - entry.count };
}
