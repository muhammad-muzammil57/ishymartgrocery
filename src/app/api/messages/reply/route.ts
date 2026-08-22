// src/app/api/messages/reply/route.ts
import { auth } from "@/auth"
import { getRedis } from "@/app/lib/redis"
import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const TTL = 10 * 24 * 60 * 60

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASS,
    },
  })
}

async function notifyUser(
  userEmail: string,
  userName: string,
  adminName: string,
  replyText: string
) {
  const transporter = createTransporter()
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ishymart-grocery.vercel.app"

  await transporter.sendMail({
    from: `"IshyMart Support" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "IshyMart - Admin ne aapke message ka jawab diya",
    html: `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:24px 32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">🛒 IshyMart</h1>
      </div>
      <div style="padding:28px;">
        <h2 style="color:#15803d;margin:0 0 8px;">💬 Aapke message ka jawab aa gaya!</h2>
        <p style="color:#4b5563;margin:0 0 20px;">
          Assalam o Alaikum <strong>${userName}</strong>! <strong>${adminName}</strong> ne aapke message ka jawab diya hai.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:20px;">
          <p style="margin:0 0 6px;color:#6b7280;font-size:12px;">Reply:</p>
          <p style="margin:0;color:#374151;line-height:1.7;">${replyText}</p>
        </div>
        <div style="text-align:center;">
          <a href="${siteUrl}"
            style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:700;">
            Messages Dekhein →
          </a>
        </div>
      </div>
      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} IshyMart</p>
      </div>
    </div>`,
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { userId, userEmail, userName, text } = await req.json()
    if (!text?.trim() || !userId) {
      return NextResponse.json({ message: "userId aur text required hain" }, { status: 400 })
    }

    const redis = getRedis()
    const key = `messages:${userId}`

    const message = JSON.stringify({
      id: Date.now().toString(),
      from: "admin",
      senderName: session.user.name,
      text: text.trim(),
      time: new Date().toISOString(),
      read: false,
    })

    await redis.rpush(key, message)
    await redis.expire(key, TTL)

    // userinfo update karo latest reply ke saath
    const userInfoKey = `userinfo:${userId}`
    await redis.set(
      userInfoKey,
      JSON.stringify({
        id: userId,
        name: userName,
        email: userEmail,
        lastMessage: `Admin: ${text.trim()}`,
        lastTime: new Date().toISOString(),
      }),
      "EX",
      TTL
    )

    // User ko email notify karo
    notifyUser(userEmail, userName, session.user.name!, text.trim()).catch(console.error)

    return NextResponse.json({ message: "Reply bhej diya!" }, { status: 200 })
  } catch (error) {
    console.error("reply error:", error)
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
  }
}
