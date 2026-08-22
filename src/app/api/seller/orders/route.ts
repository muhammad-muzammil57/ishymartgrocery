import connectDb from "@/app/lib/db"
import Order from "@/app/Models/order.model"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const user = await User.findById(session.user.id)
    if (!user || user.sellerStatus !== "approved") {
      return NextResponse.json({ message: "You are not an approved seller" }, { status: 403 })
    }

    // Sirf woh orders jin mein iss seller ka kam se kam aik item ho
    const orders = await Order.find({ "items.seller": user._id })
      .populate("user", "name email mobile")
      .sort({ createdAt: -1 })

    // Buyer ko sirf apne items ki detail dein — dusre sellers ke items chupa dein
    const sanitized = orders.map((order: any) => {
      const plain = order.toObject()
      plain.items = plain.items.filter(
        (item: any) => item.seller && item.seller.toString() === user._id.toString()
      )
      return plain
    })

    return NextResponse.json(sanitized, { status: 200 })
  } catch (error) {
    console.error("seller orders error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
