import connectDb from "@/app/lib/db"
import Order from "@/app/Models/order.model"
import User from "@/app/Models/user.model"
import Withdrawal from "@/app/Models/withdrawal.model"
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

    // Total lifetime earnings = sum of delivered order items belonging to this seller
    const deliveredOrders = await Order.find({
      "items.seller": user._id,
      status: "delivered",
    })

    let totalEarned = 0
    for (const order of deliveredOrders) {
      for (const item of order.items as any[]) {
        if (item.seller && item.seller.toString() === user._id.toString()) {
          totalEarned += (parseFloat(item.price) || 0) * (item.quantity || 0)
        }
      }
    }

    const pendingWithdrawalAgg = await Withdrawal.aggregate([
      { $match: { seller: user._id, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
    const pendingWithdrawalAmount = pendingWithdrawalAgg[0]?.total || 0

    return NextResponse.json(
      {
        totalEarned,
        availableBalance: user.sellerBalance || 0,
        pendingWithdrawalAmount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("seller earnings error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
