// src/app/api/messages/send/route.ts
import { auth } from "@/auth"
import { getRedis } from "@/app/lib/redis"
import { NextRequest, NextResponse } from "next/server"
import connectDb from "@/app/lib/db"
import User from "@/app/Models/user.model"
import nodemailer from "nodemailer"

const TTL = 10 * 24 * 60 * 60 // 10 din seconds mein

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASS,
    },
  })
}

async function notifyAdmins(userName: string, userEmail: string, messageText: string) {
  await connectDb()
  const admins = await User.find({ role: "admin" }, "email name")
  const transporter = createTransporter()
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ishymart-grocery.vercel.app"

  await Promise.all(
    admins.map((admin) =>
      transporter.sendMail({
        from: `"IshyMart Messages" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: `IshyMart - New Message from ${userName}`,
        html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:24px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">🛒 IshyMart</h1>
          </div>
          <div style="padding:28px;">
            <h2 style="color:#374151;margin:0 0 16px;">💬 New Customer Message</h2>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:16px;">
              <p style="margin:0 0 6px;color:#6b7280;font-size:12px;">From:</p>
              <p style="margin:0;color:#111827;font-weight:600;">${userName} (${userEmail})</p>
            </div>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 6px;color:#6b7280;font-size:12px;">Message:</p>
              <p style="margin:0;color:#374151;line-height:1.7;">${messageText}</p>
            </div>
            <div style="text-align:center;">
              <a href="${siteUrl}/admin/messages"
                style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:700;">
                Reply Now →
              </a>
            </div>
          </div>
          <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} IshyMart</p>
          </div>
        </div>`,
      }).catch((err) => console.error(`Email to ${admin.email} failed:`, err))
    )
  )
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { text } = await req.json()
    if (!text?.trim()) {
      return NextResponse.json({ message: "Message empty hai" }, { status: 400 })
    }

    const redis = getRedis()
    const key = `messages:${session.user.id}`

    const message = JSON.stringify({
      id: Date.now().toString(),
      from: "user",
      senderName: session.user.name,
      text: text.trim(),
      time: new Date().toISOString(),
      read: false,
    })

    // List mein push karo
    await redis.rpush(key, message)
    // 10 din TTL set karo
    await redis.expire(key, TTL)

    // User info bhi store karo (admin conversations list ke liye)
    const userInfoKey = `userinfo:${session.user.id}`
    await redis.set(
      userInfoKey,
      JSON.stringify({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        lastMessage: text.trim(),
        lastTime: new Date().toISOString(),
      }),
      "EX",
      TTL
    )

    // Admins ko email notify karo — async
    notifyAdmins(
      session.user.name!,
      session.user.email!,
      text.trim()
    ).catch(console.error)

    return NextResponse.json({ message: "Message bhej diya!" }, { status: 200 })
  } catch (error) {
    console.error("send message error:", error)
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
  }
}
