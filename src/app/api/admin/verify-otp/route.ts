// app/api/admin/verify-otp/route.ts
import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import Otp from "@/app/Models/otp.model";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { sendAdminLoginNotification } from "@/app/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { otp, mobile } = await req.json();
    if (!otp) {
      return NextResponse.json({ message: "OTP required hai" }, { status: 400 });
    }

    const otpRecord = await Otp.findOne({
      email: session.user.email,
      type: "admin-access",
    });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "OTP nahi mila, dobara credentials verify karein" },
        { status: 404 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: "OTP expire ho gaya, dobara try karein" },
        { status: 410 }
      );
    }

    if (otpRecord.otp !== otp.trim()) {
      return NextResponse.json({ message: "Galat OTP hai" }, { status: 401 });
    }

    // OTP sahi — delete karo
    await Otp.deleteOne({ _id: otpRecord._id });

    // Role + mobile update
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { role: "admin", mobile },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User nahi mila" }, { status: 404 });
    }

    // ─── IP extract ───────────────────────────────────────────────
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : req.headers.get("x-real-ip") ?? "Unknown IP";

    // ─── User-Agent se browser + device detect ────────────────────
    const ua = req.headers.get("user-agent") ?? "";

    let browser = "Unknown Browser";
    if (ua.includes("Edg"))                            browser = "Microsoft Edge";
    else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";
    else if (ua.includes("Chrome"))                    browser = "Google Chrome";
    else if (ua.includes("Firefox"))                   browser = "Mozilla Firefox";
    else if (ua.includes("Safari"))                    browser = "Apple Safari";

    let device = "Unknown Device";
    if (/android/i.test(ua))              device = "Android Mobile";
    else if (/iphone|ipad|ipod/i.test(ua)) device = "Apple iOS Device";
    else if (/mobile/i.test(ua))           device = "Mobile Device";
    else if (/tablet/i.test(ua))           device = "Tablet";
    else if (/windows/i.test(ua))          device = "Windows PC";
    else if (/macintosh|mac os/i.test(ua)) device = "Mac";
    else if (/linux/i.test(ua))            device = "Linux PC";

    // ─── Notification email — async (user wait na kare) ──────────
    sendAdminLoginNotification(
      session.user.email,
      updatedUser.name,
      ip,
      device,
      browser
    ).catch((err) => console.error("Admin notification email error:", err));

    return NextResponse.json(
      { message: "Admin verified!", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Server error: ${error}` },
      { status: 500 }
    );
  }
}