// src/app/api/messages/get/route.ts
import { auth } from "@/auth"
import { getRedis } from "@/app/lib/redis"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const redis = getRedis()
    const key = `messages:${session.user.id}`

    // Sab messages fetch karo
    const raw = await redis.lrange(key, 0, -1)
    const messages = raw.map((m) => JSON.parse(m))

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error("get messages error:", error)
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
  }
}
