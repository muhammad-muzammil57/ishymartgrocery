// src/app/api/messages/conversations/route.ts
import { auth } from "@/auth"
import { getRedis } from "@/app/lib/redis"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const redis = getRedis()

    // Sab userinfo keys dhundo
    const keys = await redis.keys("userinfo:*")

    if (!keys.length) {
      return NextResponse.json({ conversations: [] }, { status: 200 })
    }

    // Sab userinfo fetch karo
    const pipeline = redis.pipeline()
    keys.forEach((key) => pipeline.get(key))
    const results = await pipeline.exec()

    const conversations = results
      ?.map((r) => {
        if (r && r[1]) {
          try {
            return JSON.parse(r[1] as string)
          } catch {
            return null
          }
        }
        return null
      })
      .filter(Boolean)
      .sort((a: any, b: any) =>
        new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
      )

    return NextResponse.json({ conversations }, { status: 200 })
  } catch (error) {
    console.error("conversations error:", error)
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
  }
}

// Admin specific user ke messages fetch kare
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ message: "userId required" }, { status: 400 })
    }

    const redis = getRedis()
    const key = `messages:${userId}`
    const raw = await redis.lrange(key, 0, -1)
    const messages = raw.map((m) => JSON.parse(m))

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
  }
}
