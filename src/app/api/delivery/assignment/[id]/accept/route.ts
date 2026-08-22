import connectDb from "@/app/lib/db"
import DeliveryAssignment from "@/app/Models/deliveryAssignment.model"
import Order from "@/app/Models/order.model"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { emitSocketEvent } from "@/app/lib/emitSocketEvent"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Delivery boy ke paas pehle se koi active (out-of-delivery) order na ho
    const activeAssignment = await DeliveryAssignment.findOne({
      assignedTo: session.user.id,
      status: "assigned",
    })
    if (activeAssignment) {
      return NextResponse.json(
        { message: "You already have an active delivery in progress" },
        { status: 400 }
      )
    }

    // Atomic accept — race-condition-proof: sirf woh delivery boy jeetega jo
    // pehle is filter (status still "brodcasted") ke sath update kar paye.
    const assignment = await DeliveryAssignment.findOneAndUpdate(
      { _id: id, status: "brodcasted", brodcastedTo: session.user.id },
      { status: "assigned", assignedTo: session.user.id, acceptedAt: new Date() },
      { new: true }
    )

    if (!assignment) {
      return NextResponse.json(
        { message: "This order has already been accepted by another delivery partner" },
        { status: 409 }
      )
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      assignment.order,
      { assignedDeliveryBoy: session.user.id },
      { new: true }
    ).populate("assignedDeliveryBoy", "name mobile image")

    // ─── Real-time: baaki sab online delivery boys ke liye yeh broadcast
    // turant list se ghaib ho jaye (koi aur ise accept nahi kar payega) ───
    await emitSocketEvent("onlineDeliveryBoys", "delivery:broadcastTaken", {
      assignmentId: id,
    })

    // ─── Real-time: buyer ka track-order page turant dekh le ki delivery
    // partner assign ho chuka hai, naam/mobile ke sath ────────────────
    await emitSocketEvent(`order:${assignment.order}`, "order:statusUpdate", {
      status: updatedOrder?.status,
      deliveryBoy: updatedOrder?.assignedDeliveryBoy,
    })

    // ─── Admin ke "Manage Orders" page ko bhi turant pata chal jaye ─────
    await emitSocketEvent("adminOrders", "admin:ordersChanged", {
      orderId: assignment.order,
    })

    return NextResponse.json(assignment, { status: 200 })
  } catch (error) {
    console.error("delivery accept error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
