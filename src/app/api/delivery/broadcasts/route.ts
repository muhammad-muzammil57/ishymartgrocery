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

    // Sirf woh broadcasts jo ab tak "brodcasted" (unassigned) hain, is delivery
    // boy ko bheji gayi hain, aur usne khud reject nahi ki
    const assignments = await DeliveryAssignment.find({
      status: "brodcasted",
      brodcastedTo: session.user.id,
      rejectedBy: { $ne: session.user.id },
    })
      .populate({
        path: "order",
        populate: { path: "user", select: "name mobile" },
      })
      .sort({ createdAt: -1 })

    // Order khud cancel/delivered ho chuka ho to woh broadcast list se hata dein
    const valid = assignments.filter((a: any) => a.order && a.order.status === "out of delivery")

    return NextResponse.json(valid, { status: 200 })
  } catch (error) {
    console.error("delivery broadcasts error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
