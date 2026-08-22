import connectDb from "@/app/lib/db"
import DeliveryAssignment from "@/app/Models/deliveryAssignment.model"
import Order from "@/app/Models/order.model"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { emitSocketEvent } from "@/app/lib/emitSocketEvent"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { latitude, longitude } = await request.json()
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ message: "Invalid coordinates" }, { status: 400 })
    }

    // Security: sirf woh order update ho jo abhi is delivery boy ko fi'l waqt assign hai
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: session.user.id,
      status: "assigned",
    })
    if (!assignment) {
      return NextResponse.json({ message: "No active delivery to update" }, { status: 400 })
    }

    const updatedAt = new Date()
    await Order.findByIdAndUpdate(assignment.order, {
      currentLocation: { latitude, longitude, updatedAt },
    })

    // Delivery boy ki apni location bhi update kar dete hain (2dsphere index already exists)
    await User.findByIdAndUpdate(session.user.id, {
      location: { type: "Point", coordinates: [longitude, latitude] },
    })

    // ─── Real-time: buyer ke track-order page par map turant move ho, koi
    // 4-second polling ki zaroorat nahi ─────────────────────────────────
    await emitSocketEvent(`order:${assignment.order}`, "order:locationUpdate", {
      latitude,
      longitude,
      updatedAt,
    })

    return NextResponse.json({ message: "Location updated" }, { status: 200 })
  } catch (error) {
    console.error("delivery location error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
