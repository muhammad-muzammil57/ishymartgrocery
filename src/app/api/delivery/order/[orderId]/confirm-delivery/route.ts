import connectDb from "@/app/lib/db"
import { checkRateLimit } from "@/app/lib/rateLimit"
import { creditSellerEarningsForOrder } from "@/app/lib/sellerEarnings"
import { emitSocketEvent } from "@/app/lib/emitSocketEvent"
import DeliveryAssignment from "@/app/Models/deliveryAssignment.model"
import Order from "@/app/Models/order.model"
import { auth } from "@/auth"
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
    const { code } = await request.json()

    const assignment = await DeliveryAssignment.findOne({
      order: orderId,
      assignedTo: session.user.id,
      status: "assigned",
    })
    if (!assignment) {
      return NextResponse.json({ message: "This order is not assigned to you" }, { status: 403 })
    }

    const { allowed } = await checkRateLimit(`delivery-confirm:${orderId}`, 8, 60 * 10)
    if (!allowed) {
      return NextResponse.json({ message: "Too many attempts, try again later" }, { status: 429 })
    }

    const order = await Order.findById(orderId).select("+deliveryOtp +deliveryOtpExpiresAt")
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    if (order.status !== "out of delivery") {
      return NextResponse.json({ message: "Order is not out for delivery" }, { status: 400 })
    }
    if (!order.deliveryOtp || !order.deliveryOtpExpiresAt) {
      return NextResponse.json(
        { message: "No confirmation code has been generated yet" },
        { status: 400 }
      )
    }
    if (order.deliveryOtpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ message: "Code has expired, please request a new one" }, { status: 400 })
    }
    if (!code || code.toString() !== order.deliveryOtp) {
      return NextResponse.json({ message: "Incorrect code" }, { status: 400 })
    }

    order.status = "delivered"
    order.deliveredAt = new Date()
    order.deliveryOtp = undefined
    order.deliveryOtpExpiresAt = undefined
    await creditSellerEarningsForOrder(order)
    await order.save()

    assignment.status = "completed"
    await assignment.save()

    // ─── Real-time: buyer ka track-order page turant "delivered" dikhaye,
    // aur delivery boy ka apna dashboard bhi active order clear kar de ─
    await emitSocketEvent(`order:${orderId}`, "order:statusUpdate", {
      status: "delivered",
    })
    await emitSocketEvent(`deliveryBoy:${session.user.id}`, "delivery:orderCompleted", {
      orderId,
    })
    await emitSocketEvent("adminOrders", "admin:ordersChanged", { orderId })

    return NextResponse.json({ message: "Order marked as delivered" }, { status: 200 })
  } catch (error) {
    console.error("confirm delivery error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
