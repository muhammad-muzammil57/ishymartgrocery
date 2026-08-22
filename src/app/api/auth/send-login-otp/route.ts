import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import Otp from "@/app/Models/otp.model";
import bcrypt from "bcryptjs";
import { generateOtp, sendOtpEmail } from "@/app/lib/mailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and Password is Strictly Needed!" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "This email is not registered!" },
        { status: 400 }
      );
    }

    // Google users don't have password
    if (!user.password) {
      return NextResponse.json(
        { message: "Sign In With Google Please" },
        { status: 400 }
      );
    }

    // Verify password first before sending OTP
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Wrong Password!" },
        { status: 400 }
      );
    }

    // Delete any previous login OTP for this email
    await Otp.deleteMany({ email, type: "login" });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.create({ email, otp, type: "login", expiresAt });
    await sendOtpEmail(email, otp, "login");

    return NextResponse.json(
      { message: "OTP has been sent! Please check your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("send-login-otp error:", error);
    return NextResponse.json(
      { message: "Server error. Try Again." },
      { status: 500 }
    );
  }
}
