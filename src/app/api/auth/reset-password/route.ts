import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import Otp from "@/app/Models/otp.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetConfirmation } from "@/app/api/auth/forgot-password/route";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "Email, OTP aur naya password zaroori hain!" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password kam az kam 8 characters ka hona chahiye!" },
        { status: 400 }
      );
    }

    const otpRecord = await Otp.findOne({ email, type: "login" });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "OTP nahi mila. Dobara forgot password try karein." },
        { status: 400 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: "OTP expire ho gaya. Dobara try karein." },
        { status: 400 }
      );
    }

    if (otpRecord.otp !== otp.trim()) {
      return NextResponse.json(
        { message: "Ghalat OTP daala hai!" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User nahi mila." },
        { status: 404 }
      );
    }
    // OTP sahi — password update karo
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } }
    );

    // OTP delete karo
    await Otp.deleteOne({ _id: otpRecord._id });
    await sendPasswordResetConfirmation(user.email, user.name);

    return NextResponse.json(
      { message: "Password reset ho gaya! Ab login karein." },
      { status: 200 }
    );
  } catch (error) {
    console.error("reset-password error:", error);
    return NextResponse.json(
      { message: "Server error. Dobara try karein." },
      { status: 500 }
    );
  }
}
