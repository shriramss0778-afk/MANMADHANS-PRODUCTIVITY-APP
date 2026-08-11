import { headers } from "next/headers";
import { ApiError } from "./errors";

type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  var __rateLimitBuckets__: Map<string, Bucket> | undefined;
}

const buckets = (global.__rateLimitBuckets__ ??= new Map<string, Bucket>());

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export async function clientIdentifier() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "unknown";
}

/**
 * Fixed-window in-memory limiter. Best effort only: it protects a single
 * instance against credential stuffing bursts, not a distributed attack.
 */
export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    throw new ApiError(429, "TOO_MANY_REQUESTS", "Too many attempts, please try again later", {
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    });
  }
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
