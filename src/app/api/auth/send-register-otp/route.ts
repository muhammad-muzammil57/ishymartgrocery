import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import Otp from "@/app/Models/otp.model";
import bcrypt from "bcryptjs";
import { generateOtp, sendOtpEmail } from "@/app/lib/mailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please Fill All The Fields!" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be 8 characters!" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json(
        { message: "This email has been Already registered!" },
        { status: 400 }
      );
    }

    // Delete any previous OTP for this email
    await Otp.deleteMany({ email, type: "register" });

    // Hash password before storing in OTP record
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.create({
      email,
      otp,
      type: "register",
      expiresAt,
      pendingName: name,
      pendingPassword: hashedPassword,
    });

    await sendOtpEmail(email, otp, "register");

    return NextResponse.json(
      { message: "OTP has been sent! Please check your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("send-register-otp error:", error);
    return NextResponse.json(
      { message: "Server error. Try Again." },
      { status: 500 }
    );
  }
}
