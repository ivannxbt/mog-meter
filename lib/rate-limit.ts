// =============================================================================
// Upstash rate limiting (PRD NFR-4)
// =============================================================================

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RATE_LIMIT } from "@/lib/config";

export type RateLimitResult =
  | { ok: true; remaining: number; reset: number }
  | { ok: false; remaining: number; reset: number };

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(
        RATE_LIMIT.maxRequests,
        RATE_LIMIT.window,
      ),
      prefix: RATE_LIMIT.keyPrefix,
      analytics: true,
    });
  }
  return ratelimit;
}

/** IP del cliente detrás de proxy (Vercel / local). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "127.0.0.1";
}

/**
 * Comprueba el límite por IP.
 * Sin credenciales Upstash: en desarrollo permite pasar; en producción falla cerrado.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = getRatelimit();

  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, remaining: 0, reset: Date.now() + 60_000 };
    }
    return { ok: true, remaining: RATE_LIMIT.maxRequests, reset: Date.now() };
  }

  const { success, remaining, reset } = await limiter.limit(ip);
  if (success) {
    return { ok: true, remaining, reset };
  }
  return { ok: false, remaining, reset };
}
