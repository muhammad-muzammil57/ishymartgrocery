import connectDb from "@/app/lib/db"
import DeliveryAssignment from "@/app/Models/deliveryAssignment.model"
import { auth } from "@/auth"
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

    await DeliveryAssignment.findOneAndUpdate(
      { _id: id, status: "brodcasted" },
      { $addToSet: { rejectedBy: session.user.id } }
    )

    return NextResponse.json({ message: "Order dismissed" }, { status: 200 })
  } catch (error) {
    console.error("delivery reject error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
