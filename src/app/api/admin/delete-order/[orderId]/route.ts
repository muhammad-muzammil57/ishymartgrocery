import connectDb from "@/app/lib/db"
import Order from "@/app/Models/order.model"
import { auth } from "@/auth"
import { emitSocketEvent } from "@/app/lib/emitSocketEvent"
import { NextRequest, NextResponse } from "next/server"

// Admin dashboard se "Delete" button click karte hi order database se hat
// jata hai. Sirf "delivered" order hi delete kiya ja sakta hai — pending ya
// out-of-delivery order galti se delete na ho jaye, is liye yeh check laga
// hai.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb()
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await params
    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    if (order.status !== "delivered") {
      return NextResponse.json(
        { message: "Sirf delivered order hi delete kiya ja sakta hai" },
        { status: 400 }
      )
    }

    await Order.findByIdAndDelete(orderId)

    // ─── Agar admin dashboard ek se zyada tabs/devices mein khula ho, sab
    // jagah yeh order list se turant hat jaye ──────────────────────────
    await emitSocketEvent("adminOrders", "admin:ordersChanged", { orderId, deleted: true })

    return NextResponse.json({ message: "Order deleted" }, { status: 200 })
  } catch (error) {
    console.error("delete order error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
