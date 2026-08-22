import connectDb from "@/app/lib/db"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { isOnline } = await request.json()

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { isOnline: !!isOnline },
      { new: true }
    ).select("isOnline")

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error("delivery status error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const user = await User.findById(session.user.id).select("isOnline")
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error("delivery status GET error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
