import connectDb from "@/app/lib/db"
import Order from "@/app/Models/order.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await params
    const order = await Order.findById(orderId).populate(
      "assignedDeliveryBoy",
      "name mobile image"
    )
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    // Security: buyer sirf apna order track kar sakta hai
    if (order.user.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(
      {
        status: order.status,
        address: order.address,
        deliveryBoy: order.assignedDeliveryBoy,
        currentLocation: order.currentLocation,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("track order error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
