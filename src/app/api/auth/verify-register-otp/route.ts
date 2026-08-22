import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import Otp from "@/app/Models/otp.model";
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/app/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and Password is Strictly Needed!" },
        { status: 400 }
      );
    }

    // Find OTP record
    const otpRecord = await Otp.findOne({ email, type: "register" });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "OTP not found. Please register again." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: "OTP has been expired. Please try again." },
        { status: 400 }
      );
    }

    // Check OTP match
    if (otpRecord.otp !== otp.trim()) {
      return NextResponse.json(
        { message: "You Entered Wrong OTP!" },
        { status: 400 }
      );
    }

    // Double check user doesn't exist (race condition protection)
    const existUser = await User.findOne({ email });
    if (existUser) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: "This email has been Already Registered!" },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name: otpRecord.pendingName,
      email,
      password: otpRecord.pendingPassword,
    });

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

   await sendWelcomeEmail(email, otpRecord.pendingName || "User").catch((err) =>
      console.error("Welcome email error:", err)
    );

    return NextResponse.json(
      { message: "Account has been created! Now login to Your Account.", userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("verify-register-otp error:", error);
    return NextResponse.json(
      { message: "Server error. Try Again." },
      { status: 500 }
    );
  }
}
