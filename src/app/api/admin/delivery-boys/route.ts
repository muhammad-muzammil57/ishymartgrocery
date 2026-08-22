import connectDb from "@/app/lib/db"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDb()
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const deliveryBoys = await User.find({ role: "deliveryBoy", isOnline: true }).select(
      "name mobile image"
    )

    return NextResponse.json(deliveryBoys, { status: 200 })
  } catch (error) {
    console.error("admin delivery-boys error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
