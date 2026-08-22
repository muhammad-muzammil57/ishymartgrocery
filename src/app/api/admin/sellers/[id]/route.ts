import connectDb from "@/app/lib/db"
import Grocery from "@/app/Models/grocery.model"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const seller = await User.findById(id).select(
      "name email image mobile storeName sellerStatus sellerBalance sellerSuspendReason createdAt"
    )
    if (!seller) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 })
    }

    const products = await Grocery.find({ seller: id }).sort({ createdAt: -1 })

    return NextResponse.json({ seller, products }, { status: 200 })
  } catch (error) {
    console.error("admin seller detail error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
