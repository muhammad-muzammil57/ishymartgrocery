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

    const sellers = await User.find({
      sellerStatus: { $in: ["approved", "suspended"] },
    })
      .select("name email image storeName sellerStatus sellerBalance sellerSuspendReason createdAt")
      .sort({ createdAt: -1 })

    return NextResponse.json(sellers, { status: 200 })
  } catch (error) {
    console.error("admin sellers list error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
