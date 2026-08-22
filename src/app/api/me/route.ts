import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized || User is not athenticated" },
        { status: 400 }
      );
    }
    const user = await User.findOne({ email: session.user.email }).select(
      "-password"
    );
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Api/me error:",error)
    return NextResponse.json(
      { message: `Internal Server Error : ${error}` },
      { status: 500 }
    );
  }
}
