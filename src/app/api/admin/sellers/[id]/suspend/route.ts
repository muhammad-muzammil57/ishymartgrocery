import connectDb from "@/app/lib/db"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { sendSellerSuspendedEmail } from "@/app/lib/mailer"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
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
    const { action, reason } = await request.json() // action: "suspend" | "reinstate"

    const seller = await User.findById(id)
    if (!seller) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 })
    }

    if (action === "suspend") {
      if (!reason || !reason.trim()) {
        return NextResponse.json({ message: "Suspension reason is required" }, { status: 400 })
      }
      if (seller.sellerStatus !== "approved") {
        return NextResponse.json({ message: "Seller is not currently active" }, { status: 400 })
      }
      // Sirf seller side suspend hoti hai — buyer/user account chalta rehta hai
      seller.sellerStatus = "suspended"
      seller.sellerSuspendReason = reason.trim()
      await seller.save()

      sendSellerSuspendedEmail(seller.email, seller.name, reason.trim()).catch((err) =>
        console.error("seller suspend email error:", err)
      )

      return NextResponse.json({ message: "Seller suspended", seller }, { status: 200 })
    }

    if (action === "reinstate") {
      if (seller.sellerStatus !== "suspended") {
        return NextResponse.json({ message: "Seller is not suspended" }, { status: 400 })
      }
      seller.sellerStatus = "approved"
      seller.sellerSuspendReason = undefined
      await seller.save()
      return NextResponse.json({ message: "Seller reinstated", seller }, { status: 200 })
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("admin seller suspend error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
