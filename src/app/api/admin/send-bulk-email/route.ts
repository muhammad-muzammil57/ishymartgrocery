import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import { auth } from "@/auth";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASS,
  },
});

function buildEmailHtml(subject: string, body: string, senderName: string) {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">🛒 IshyMart</h1>
      <p style="margin:6px 0 0;color:#bbf7d0;font-size:13px;">Fresh groceries delivered to your door</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="color:#15803d;margin:0 0 16px;font-size:20px;">${subject}</h2>
      <div style="color:#374151;font-size:15px;line-height:1.8;white-space:pre-wrap;">${body}</div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        Yeh email IshyMart ki taraf se bheja gaya — <strong>${senderName}</strong>
      </p>
      <p style="margin:8px 0 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ishymart.com'}" 
           style="color:#16a34a;font-size:12px;text-decoration:none;">ishymart.com</a>
      </p>
    </div>
  </div>`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Sirf admin yeh kar sakta hai!" }, { status: 401 });
    }

    await connectDb();
    const { subject, body, targetRole } = await req.json();

    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json({ message: "Subject aur body dono zaroori hain!" }, { status: 400 });
    }

    // Users fetch karo — role filter ke saath
    const filter: any = {};
    if (targetRole && targetRole !== "all") filter.role = targetRole;

    const users = await User.find(filter).select("email name");

    if (users.length === 0) {
      return NextResponse.json({ message: "Koi user nahi mila!" }, { status: 400 });
    }

    const html = buildEmailHtml(subject, body, session.user.name || "IshyMart Admin");

    // Batch mein bhejo — Gmail rate limit se bachne ke liye (max 10 at a time)
    const BATCH_SIZE = 10;
    let sent = 0;
    let failed = 0;
    const failedEmails: string[] = [];

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (user) => {
          try {
            await transporter.sendMail({
              from: `"IshyMart" <${process.env.EMAIL_USER}>`,
              to: user.email,
              subject,
              html,
            });
            sent++;
          } catch (err) {
            failed++;
            failedEmails.push(user.email);
            console.error(`Email failed for ${user.email}:`, err);
          }
        })
      );

      // Batches ke beech 1 second wait — Gmail throttle se bachne ke liye
      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      message: `Email bhejne ka kaam mukammal! ${sent} successful, ${failed} failed.`,
      sent,
      failed,
      failedEmails: failedEmails.slice(0, 10), // sirf pehle 10 dikhao
      total: users.length,
    });
  } catch (error) {
    console.error("Bulk email error:", error);
    return NextResponse.json({ message: "Server error. Dobara try karein." }, { status: 500 });
  }
}

// GET — kitne users hain count karo (preview ke liye)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const { searchParams } = new URL(req.url);
    const targetRole = searchParams.get("role");

    const filter: any = {};
    if (targetRole && targetRole !== "all") filter.role = targetRole;

    const count = await User.countDocuments(filter);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
