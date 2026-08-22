import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const user = await User.findOne({ email: session.user.email }).select(
      "name email mobile image role password"
    );

    if (!user) {
      return NextResponse.json({ message: "User nahi mila!" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      mobile: user.mobile || "",
      image: user.image || "",
      role: user.role,
      hasPassword: !!user.password, // Google users ke liye false
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error." },
      { status: 500 }
    );
  }
}
