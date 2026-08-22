// app/api/admin/verify-credentials/route.ts
// Step 1: Admin apna username + password deta hai
// Agar sahi hain to OTP bhejta hai email pe

import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import Otp from "@/app/Models/otp.model";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { sendAdminOtpEmail } from "@/app/lib/mailer"; // aap khud yeh function banein (neeche sample hai)

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username aur password dono required hain" },
        { status: 400 }
      );
    }

    // Sirf us user ka record check karo jo login hai
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User nahi mila" }, { status: 404 });
    }

    // Check karo k is email ke liye adminCredentials exist karti hain
    if (!user.adminCredentials) {
      return NextResponse.json(
        { message: "Is account ke liye admin access allowed nahi" },
        { status: 403 }
      );
    }

    // Username aur password match karo
    if (
      user.adminCredentials.username !== username ||
      user.adminCredentials.password !== password
    ) {
      return NextResponse.json(
        { message: "Username ya password galat hai" },
        { status: 401 }
      );
    }

    // Credentials sahi hain — OTP generate karo
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minute

    // Purana OTP delete karo (agar tha)
    await Otp.deleteMany({ email: session.user.email, type: "admin-access" });

    // Naya OTP save karo
    await Otp.create({
      email: session.user.email,
      otp,
      type: "admin-access",
      expiresAt,
    });

    // OTP email bhejo
    await sendAdminOtpEmail(session.user.email, user.name, otp);

    return NextResponse.json(
      { message: "OTP bhej diya gaya hai aapki email pe" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Server error: ${error}` },
      { status: 500 }
    );
  }
}
