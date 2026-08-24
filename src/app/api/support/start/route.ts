// src/app/api/support/start/route.ts
import connectDb from "@/app/lib/db"
import User from "@/app/Models/user.model"
import Chat from "@/app/Models/chat.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import nodemailer from "nodemailer"
import { generateJoinCode, hashJoinCode } from "@/app/lib/joinToken"

const JOIN_CODE_TTL_MS = 15 * 60 * 1000 // 15 minute

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASS,
    },
  })
}

async function sendAdminChatAlert(
  adminEmail: string,
  adminName: string,
  userName: string,
  userEmail: string,
  roomId: string,
  joinCode: string
) {
  const transporter = createTransporter()
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ishymart-grocery.vercel.app"}/admin/livechat/${roomId}`

  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">🛒 IshyMart</h1>
      <p style="margin:6px 0 0;color:#bbf7d0;font-size:13px;">Live Support Request</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#15803d;margin:0 0 8px;">💬 New Live Chat Request</h2>
      <p style="color:#4b5563;margin:0 0 20px;line-height:1.6;">
        Assalam o Alaikum <strong>${adminName}</strong>!<br/>
        Ek customer live chat support maang raha hai.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
        <table style="width:100%;font-size:13px;color:#4b5563;border-collapse:collapse;">
          <tr>
            <td style="padding:5px 0;color:#6b7280;">👤 Customer:</td>
            <td style="padding:5px 0;font-weight:600;">${userName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">📧 Email:</td>
            <td style="padding:5px 0;font-weight:600;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">🕐 Time:</td>
            <td style="padding:5px 0;font-weight:600;">${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}</td>
          </tr>
        </table>
      </div>
      <div style="background:#111827;border-radius:12px;padding:18px 20px;margin-bottom:20px;text-align:center;">
        <p style="margin:0 0 6px;color:#9ca3af;font-size:11px;letter-spacing:1px;text-transform:uppercase;">🔒 Security Code (link kholne ke baad yeh enter karein)</p>
        <p style="margin:0;color:#4ade80;font-size:32px;font-weight:800;letter-spacing:8px;font-family:monospace;">${joinCode}</p>
        <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;">Yeh code sirf 15 minute ke liye valid hai. Kisi ke saath share na karein.</p>
      </div>
      <div style="text-align:center;">
        <a href="${joinUrl}"
          style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:15px;">
          💬 Join Live Chat
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;margin-top:16px;text-align:center;">
        Link kholne ke baad login + upar wala security code dono chahiye honge. Sirf ek admin join kar sakta hai — pehle join karne wala connect hoga.
      </p>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} IshyMart</p>
    </div>
  </div>`

  await transporter.sendMail({
    from: `"IshyMart Support" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `IshyMart - Live Chat Request from ${userName}`,
    html,
  })
}

export async function POST(req: NextRequest) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // session.user is guaranteed to exist here because of the check above
    const user = session.user!

    // provide a safe fallback for name if it's missing
    const userName = user.name ?? "Customer"
    const userEmail = user.email
    const userId = user.id

    const roomId = uuidv4()

    // ─── Security code (2nd factor) ──────────────────────────────
    // Plain code kabhi DB mein save nahi hota — sirf hash. Email mein
    // jo plain code jayega, wahi admin ko manually enter karna hoga.
    const joinCode = generateJoinCode()

    // Create chat room
    await Chat.create({
      roomId,
      userId,
      userName,
      userEmail,
      status: "waiting",
      messages: [],
      joinCodeHash: hashJoinCode(roomId, joinCode),
      joinCodeExpiresAt: new Date(Date.now() + JOIN_CODE_TTL_MS),
      joinCodeAttempts: 0,
    })

    // Find all admins
    const admins = await User.find({ role: "admin" })

    // Email all admins
    await Promise.all(
      admins.map((admin) =>
        sendAdminChatAlert(
          admin.email,
          admin.name,
          userName,
          userEmail,
          roomId,
          joinCode
        ).catch((err) => console.error(`Email to ${admin.email} failed:`, err))
      )
    )

    return NextResponse.json({ roomId }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
  }
}
