import connectDb from "@/app/lib/db"
import SellerApplication from "@/app/Models/sellerApplication.model"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(session.user.id).select(
      "sellerStatus storeName sellerBalance sellerSuspendReason role"
    )
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const latestApplication = await SellerApplication.findOne({ user: session.user.id }).sort({
      createdAt: -1,
    })

    return NextResponse.json(
      {
        sellerStatus: user.sellerStatus,
        storeName: user.storeName,
        sellerBalance: user.sellerBalance,
        sellerSuspendReason: user.sellerSuspendReason,
        application: latestApplication,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("seller status error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
