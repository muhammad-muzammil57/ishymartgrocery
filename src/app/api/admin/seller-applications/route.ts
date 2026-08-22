import connectDb from "@/app/lib/db"
import SellerApplication from "@/app/Models/sellerApplication.model"
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
    const status = searchParams.get("status") // pending | approved | rejected | all

    const filter: any = {}
    if (status && status !== "all") filter.status = status

    const applications = await SellerApplication.find(filter)
      .populate("user", "name email image role")
      .sort({ createdAt: -1 })

    return NextResponse.json(applications, { status: 200 })
  } catch (error) {
    console.error("list seller applications error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
