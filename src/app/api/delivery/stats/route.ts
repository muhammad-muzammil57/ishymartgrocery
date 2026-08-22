import connectDb from "@/app/lib/db"
import Order from "@/app/Models/order.model"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Delivery boy ke apne account mein: usne aaj kitne order deliver kiye, pichle
// hafte kitne kiye, aur is mahine kitne kiye — sab yahan se milta hai.
export async function GET() {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    // Aaj: local din ki shuruaat se ab tak
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Pichla hafta: 7 din pehle se aaj tak (rolling 7 days, "last week" ka
    // sabse common/samajh mein aane wala matlab)
    const sevenDaysAgo = new Date(startOfToday)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Is mahine: current calendar month ki shuruaat se ab tak
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const baseFilter = {
      assignedDeliveryBoy: session.user.id,
      status: "delivered",
    }

    const [today, lastWeek, thisMonth] = await Promise.all([
      Order.countDocuments({ ...baseFilter, deliveredAt: { $gte: startOfToday } }),
      Order.countDocuments({ ...baseFilter, deliveredAt: { $gte: sevenDaysAgo } }),
      Order.countDocuments({ ...baseFilter, deliveredAt: { $gte: startOfMonth } }),
    ])

    return NextResponse.json({ today, lastWeek, thisMonth }, { status: 200 })
  } catch (error) {
    console.error("delivery stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
