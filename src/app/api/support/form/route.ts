import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ message: "Sab fields required hain" }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS,
      },
    })

    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:24px 32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">🛒 IshyMart Support</h1>
      </div>
      <div style="padding:28px;">
        <h2 style="color:#374151;margin:0 0 16px;">📩 New Support Message</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="color:#6b7280;padding:6px 0;width:30%;">Name:</td><td style="font-weight:600;color:#111827;">${name}</td></tr>
          <tr><td style="color:#6b7280;padding:6px 0;">Email:</td><td style="font-weight:600;color:#111827;">${email}</td></tr>
        </table>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-top:16px;">
          <p style="margin:0 0 6px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</p>
          <p style="margin:0;color:#374151;line-height:1.7;">${message}</p>
        </div>
      </div>
    </div>`

    await transporter.sendMail({
      from: `"IshyMart Support" <${process.env.EMAIL_USER}>`,
      to: "asadpkonoff@gmail.com",
      replyTo: email,
      subject: `IshyMart Support - Message from ${name}`,
      html,
    })

    return NextResponse.json({ message: "Message bhej diya!" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
  }
}
