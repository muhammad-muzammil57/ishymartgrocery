import connectDb from "@/app/lib/db"
import User from "@/app/Models/user.model"
import Withdrawal from "@/app/Models/withdrawal.model"
import { auth } from "@/auth"
import { sendWithdrawalDecisionEmail } from "@/app/lib/mailer"
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
    const { action, reason } = await request.json()

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }
    if (action === "reject" && (!reason || !reason.trim())) {
      return NextResponse.json({ message: "Rejection reason is required" }, { status: 400 })
    }

    const withdrawal = await Withdrawal.findById(id)
    if (!withdrawal) {
      return NextResponse.json({ message: "Withdrawal request not found" }, { status: 404 })
    }
    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { message: "This request has already been reviewed" },
        { status: 400 }
      )
    }

    const seller = await User.findById(withdrawal.seller)
    if (!seller) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 })
    }

    withdrawal.status = action === "approve" ? "approved" : "rejected"
    if (action === "reject") withdrawal.rejectionReason = reason.trim()
    withdrawal.reviewedBy = session.user.id as any
    withdrawal.reviewedAt = new Date()

    if (action === "approve") {
      // Approved ho jaye to seller ke page se ghaib, admin ke pass copy rehti hai
      withdrawal.hiddenForSeller = true
    } else {
      // Reject hua to amount wapis seller ke available balance mein add karo
      seller.sellerBalance = (seller.sellerBalance || 0) + withdrawal.amount
      await seller.save()
    }

    await withdrawal.save()

    sendWithdrawalDecisionEmail(
      seller.email,
      seller.name,
      action === "approve",
      withdrawal.amount,
      action === "reject" ? reason : undefined
    ).catch((err) => console.error("withdrawal decision email error:", err))

    return NextResponse.json({ message: "Decision recorded", withdrawal }, { status: 200 })
  } catch (error) {
    console.error("admin withdrawal decision error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
