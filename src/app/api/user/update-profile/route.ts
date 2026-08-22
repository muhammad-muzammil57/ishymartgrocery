import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const { name, mobile, image, currentPassword, newPassword } = await req.json();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User nahi mila!" }, { status: 404 });
    }

    const updates: Record<string, string> = {};

    // Name update
    if (name && name.trim() !== "") {
      updates.name = name.trim();
    }

    // Mobile update
    if (mobile !== undefined) {
      if (mobile !== "" && !/^[0-9]{10,15}$/.test(mobile)) {
        return NextResponse.json(
          { message: "Mobile number 10-15 digits ka hona chahiye!" },
          { status: 400 }
        );
      }
      updates.mobile = mobile;
    }

    // Image update
    if (image && image.trim() !== "") {
      updates.image = image.trim();
    }

    // Password update / set
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { message: "Naya password kam az kam 8 characters ka hona chahiye!" },
          { status: 400 }
        );
      }

      // If user already has a password, verify current password first
      if (user.password) {
        if (!currentPassword) {
          return NextResponse.json(
            { message: "Purana password daalna zaroori hai!" },
            { status: 400 }
          );
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json(
            { message: "Purana password ghalat hai!" },
            { status: 400 }
          );
        }
      }
      // Google user setting password for first time — no current password needed
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "Kuch update karne ke liye nahi diya!" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updates },
      { new: true }
    );

    if(!updatedUser){
      return NextResponse.json(
        { message: "User update nahi hua!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Profile update ho gaya!",
        user: {
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          image: updatedUser.image,
          role: updatedUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Server error. Dobara try karein." },
      { status: 500 }
    );
  }
}
