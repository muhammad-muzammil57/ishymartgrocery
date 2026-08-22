import connectDb from "@/app/lib/db"
import DeliveryAssignment from "@/app/Models/deliveryAssignment.model"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const assignment = await DeliveryAssignment.findOne({
      assignedTo: session.user.id,
      status: "assigned",
    }).populate({
      path: "order",
      populate: { path: "user", select: "name mobile email" },
    })

    if (!assignment || !assignment.order) {
      return NextResponse.json({ order: null }, { status: 200 })
    }

    return NextResponse.json({ order: assignment.order, assignmentId: assignment._id }, { status: 200 })
  } catch (error) {
    console.error("delivery active order error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
