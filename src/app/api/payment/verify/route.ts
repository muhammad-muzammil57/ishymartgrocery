// app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/app/lib/db"
import Order from "@/app/Models/order.model"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ paid: false, error: "orderId missing" }, { status: 400 })
    }

    await dbConnect()

    // ✅ Database mein check karo - webhook ne order save kiya ya nahi
    const order = await Order.findOne({
      "meta.orderId": orderId,
      isPaid: true,
    }).select("_id isPaid status createdAt")

    if (order) {
      return NextResponse.json({
        paid: true,
        orderId,
        status: order.status,
        createdAt: order.createdAt,
      })
    }

    return NextResponse.json({ paid: false })
  } catch (error: any) {
    console.error("[VERIFY ERROR]", error.message)
    return NextResponse.json({ paid: false }, { status: 500 })
  }
}
