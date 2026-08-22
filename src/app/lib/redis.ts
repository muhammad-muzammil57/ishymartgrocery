// src/app/lib/redis.ts
import Redis from "ioredis"

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.AIVEN_REDIS_URL!, {
      tls: {
        rejectUnauthorized: false, // Aiven ke liye zaroori
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })

    redis.on("error", (err) => {
      console.error("Redis connection error:", err)
    })

    redis.on("connect", () => {
      console.log("Redis connected!")
    })
  }
  return redis
}
