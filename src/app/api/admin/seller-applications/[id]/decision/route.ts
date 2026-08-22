import connectDb from "@/app/lib/db"
import SellerApplication from "@/app/Models/sellerApplication.model"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { sendSellerApplicationDecisionEmail } from "@/app/lib/mailer"
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
      return NextResponse.json(
        { message: "Rejection reason is required" },
        { status: 400 }
      )
    }

    const application = await SellerApplication.findById(id).populate("user")
    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }
    if (application.status !== "pending") {
      return NextResponse.json(
        { message: "This application has already been reviewed" },
        { status: 400 }
      )
    }

    const user = await User.findById((application.user as any)._id)
    if (!user) {
      return NextResponse.json({ message: "Applicant user not found" }, { status: 404 })
    }

    application.status = action === "approve" ? "approved" : "rejected"
    if (action === "reject") application.rejectionReason = reason.trim()
    application.reviewedBy = session.user.id as any
    application.reviewedAt = new Date()
    await application.save()

    if (action === "approve") {
      user.sellerStatus = "approved"
      user.isSeller = true
    } else {
      user.sellerStatus = "rejected"
      user.isSeller = false
    }
    await user.save()

    sendSellerApplicationDecisionEmail(
      user.email,
      user.name,
      action === "approve",
      action === "reject" ? reason : undefined
    ).catch((err) => console.error("seller decision email error:", err))

    return NextResponse.json({ message: "Decision recorded", application }, { status: 200 })
  } catch (error) {
    console.error("seller application decision error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
