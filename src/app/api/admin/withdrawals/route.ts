import connectDb from "@/app/lib/db"
import Withdrawal from "@/app/Models/withdrawal.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectDb()
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const filter: any = {}
    if (status && status !== "all") filter.status = status

    // Admin hamesha sab dekh sakta hai, chahay seller ke page se hide ho chuki ho
    const withdrawals = await Withdrawal.find(filter)
      .populate("seller", "name email storeName")
      .sort({ createdAt: -1 })

    return NextResponse.json(withdrawals, { status: 200 })
  } catch (error) {
    console.error("admin withdrawals GET error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
