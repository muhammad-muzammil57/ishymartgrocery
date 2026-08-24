// src/app/api/admin/livechat/[roomId]/resend-code/route.ts
//
// Agar 15 minute mein code expire ho jaye ya attempts khatam ho jayen,
// admin yahan se naya code apne email par mangwa sakta hai.
import connectDb from "@/app/lib/db"
import Chat from "@/app/Models/chat.model"
import { auth } from "@/auth"
import { generateJoinCode, hashJoinCode } from "@/app/lib/joinToken"
import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const JOIN_CODE_TTL_MS = 15 * 60 * 1000

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASS,
    },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { roomId } = await params
    const chat = await Chat.findOne({ roomId })
    if (!chat) {
      return NextResponse.json({ message: "Chat room not found" }, { status: 404 })
    }
    if (chat.status === "closed") {
      return NextResponse.json({ message: "Yeh chat pehle hi band ho chuki hai" }, { status: 400 })
    }

    const joinCode = generateJoinCode()
    chat.joinCodeHash = hashJoinCode(roomId, joinCode)
    chat.joinCodeExpiresAt = new Date(Date.now() + JOIN_CODE_TTL_MS)
    chat.joinCodeAttempts = 0
    await chat.save()

    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"IshyMart Support" <${process.env.EMAIL_USER}>`,
      to: session.user.email!,
      subject: "IshyMart - Naya Live Chat Security Code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;">
          <div style="background:#111827;border-radius:12px;padding:20px;text-align:center;">
            <p style="margin:0 0 6px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Naya Security Code</p>
            <p style="margin:0;color:#4ade80;font-size:32px;font-weight:800;letter-spacing:8px;font-family:monospace;">${joinCode}</p>
            <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;">15 minute ke liye valid hai.</p>
          </div>
        </div>`,
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("resend-code error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
