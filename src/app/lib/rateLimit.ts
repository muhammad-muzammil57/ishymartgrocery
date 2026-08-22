import { getRedis } from "./redis"

/**
 * Sliding-window-ish fixed-window rate limiter using Redis.
 * Returns true if the request is allowed, false if the limit was hit.
 *
 * key        - unique key, e.g. `seller-apply:${userId}`
 * limit      - max number of requests allowed in the window
 * windowSecs - window size in seconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSecs: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const redis = getRedis()
    const redisKey = `ratelimit:${key}`
    const count = await redis.incr(redisKey)
    if (count === 1) {
      await redis.expire(redisKey, windowSecs)
    }
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
  } catch (err) {
    // Redis down honay ki soorat mein fail-open na karein critical flows ke liye,
    // lekin app ko crash bhi na hone dein — log kar ke allow kar dete hain.
    console.error("rateLimit error:", err)
    return { allowed: true, remaining: limit }
  }
}

/** Allowed mime types + max size (bytes) for KYC / verification document uploads */
export const ALLOWED_DOC_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]
export const MAX_DOC_SIZE_BYTES = 8 * 1024 * 1024 // 8MB

export function validateDocumentFile(file: Blob | null, fieldName: string): string | null {
  if (!file) return `${fieldName} is required`
  if (file.size === 0) return `${fieldName} is empty`
  if (file.size > MAX_DOC_SIZE_BYTES) return `${fieldName} must be smaller than 8MB`
  if (file.type && !ALLOWED_DOC_MIME_TYPES.includes(file.type)) {
    return `${fieldName} must be a JPG, PNG, WEBP or PDF file`
  }
  return null
}
