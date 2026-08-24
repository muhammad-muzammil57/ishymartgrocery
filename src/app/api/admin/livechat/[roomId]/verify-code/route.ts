// src/app/api/admin/livechat/[roomId]/verify-code/route.ts
//
// Livechat join ka 2nd security factor. Admin login (session, role=admin)
// hone ke bawajood, is route ke bina koi bhi chat:join nahi kar sakta —
// yehi email wala 6-digit code sahi enter karne par ek signed join token
// milta hai jo socket server ko verify karna zaroori hota hai.
import connectDb from "@/app/lib/db"
import Chat from "@/app/Models/chat.model"
import { auth } from "@/auth"
import { hashJoinCode, signJoinToken } from "@/app/lib/joinToken"
import { NextRequest, NextResponse } from "next/server"

const MAX_ATTEMPTS = 5

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDb()
    const session = await auth()

    // ─── Factor 1: login + role ───────────────────────────────────
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { roomId } = await params
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ message: "Code required" }, { status: 400 })
    }

    const chat = await Chat.findOne({ roomId })
    if (!chat) {
      return NextResponse.json({ message: "Chat room not found" }, { status: 404 })
    }

    if (chat.status === "closed") {
      return NextResponse.json({ message: "Yeh chat pehle hi band ho chuki hai" }, { status: 400 })
    }

    if (chat.adminId && chat.adminId !== session.user.id) {
      return NextResponse.json(
        { message: "Koi doosra admin pehle se is chat mein connected hai" },
        { status: 409 }
      )
    }

    if ((chat.joinCodeAttempts ?? 0) >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { message: "Bohat zyada ghalat attempts. Naya code mangwayein (resend)." },
        { status: 429 }
      )
    }

    if (!chat.joinCodeHash || !chat.joinCodeExpiresAt || new Date() > chat.joinCodeExpiresAt) {
      return NextResponse.json(
        { message: "Code expire ho chuka hai. Naya code mangwayein (resend)." },
        { status: 410 }
      )
    }

    const providedHash = hashJoinCode(roomId, code.trim())
    if (providedHash !== chat.joinCodeHash) {
      chat.joinCodeAttempts = (chat.joinCodeAttempts ?? 0) + 1
      await chat.save()
      const left = MAX_ATTEMPTS - chat.joinCodeAttempts
      return NextResponse.json(
        { message: `Ghalat code. ${Math.max(left, 0)} attempt(s) baaki hain.` },
        { status: 401 }
      )
    }

    // ─── Factor 2 verified ✅ — signed join token issue karo ───────
    // Code ko turant invalidate NAHI karte (taa k page refresh par
    // dobara code na maangna pade) — bas attempts reset kar dete hain.
    chat.joinCodeAttempts = 0
    await chat.save()

    const token = signJoinToken({
      roomId,
      adminId: session.user.id,
      adminName: session.user.name || "Admin",
    })

    return NextResponse.json({ token }, { status: 200 })
  } catch (error) {
    console.error("verify-code error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
