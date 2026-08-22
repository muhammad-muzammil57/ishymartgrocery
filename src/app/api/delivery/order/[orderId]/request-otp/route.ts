import connectDb from "@/app/lib/db"
import { checkRateLimit } from "@/app/lib/rateLimit"
import DeliveryAssignment from "@/app/Models/deliveryAssignment.model"
import Order from "@/app/Models/order.model"
import { auth } from "@/auth"
import { sendDeliveryOtpEmail } from "@/app/lib/mailer"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await params

    // Security: sirf woh delivery boy jo isi order ke liye currently assign hai
    const assignment = await DeliveryAssignment.findOne({
      order: orderId,
      assignedTo: session.user.id,
      status: "assigned",
    })
    if (!assignment) {
      return NextResponse.json({ message: "This order is not assigned to you" }, { status: 403 })
    }

    const { allowed } = await checkRateLimit(`delivery-otp:${orderId}`, 5, 60 * 10)
    if (!allowed) {
      return NextResponse.json({ message: "Too many OTP requests, try again later" }, { status: 429 })
    }

    const order = await Order.findById(orderId).populate("user")
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    if (order.status !== "out of delivery") {
      return NextResponse.json({ message: "Order is not out for delivery" }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    order.deliveryOtp = otp
    order.deliveryOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000)
    await order.save()

    const buyer = order.user as any
    await sendDeliveryOtpEmail(buyer.email, buyer.name, otp, order._id!.toString())

    return NextResponse.json({ message: "Confirmation code sent to buyer's email" }, { status: 200 })
  } catch (error) {
    console.error("request delivery otp error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
