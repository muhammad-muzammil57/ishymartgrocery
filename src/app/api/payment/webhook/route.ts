// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/app/lib/db"
import Order from "@/app/Models/order.model"
import PendingOrder from "@/app/Models/PendingOrder"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  let rawBody = ""

  try {
    rawBody = await req.text()

    // ===== DEBUG LOGS =====
    const signature = req.headers.get("x-sfpy-signature") || ""
    console.log("=== WEBHOOK HIT ===")
    console.log("Signature received:", signature ? signature.substring(0, 20) + "..." : "EMPTY")
    console.log("WEBHOOK_SECRET exists:", process.env.SAFEPAY_WEBHOOK_SECRET ? "YES" : "NO - MISSING!")
    console.log("Raw body length:", rawBody.length)

    await dbConnect()

    const event = JSON.parse(rawBody)
    const eventType: string = event?.data?.type || ""
    const trackerToken: string = event?.data?.notification?.tracker || ""

    console.log("Event type:", eventType)
    console.log("Tracker token:", trackerToken)

    // ⚠️  SIGNATURE VERIFICATION TEMPORARILY DISABLED - DEBUG MODE
    // Jab sab kuch kaam karne lage tab neeche wala section uncomment karo
    // aur upar wala comment karo

    /*
    const crypto = require("crypto")
    const expectedSig = crypto
      .createHmac("sha512", process.env.SAFEPAY_WEBHOOK_SECRET!)
      .update(Buffer.from(rawBody))
      .digest("hex")
    if (signature !== expectedSig) {
      console.log("SIGNATURE MISMATCH - rejecting")
      return NextResponse.json({ received: false }, { status: 200 })
    }
    console.log("Signature verified OK")
    */

    // ==============================
    // ✅ PAYMENT SUCCESSFUL
    // ==============================
    if (eventType === "payment:created") {
      console.log("Searching PendingOrder for tracker:", trackerToken)

      const pendingOrder = await PendingOrder.findOne({ trackerToken })
      console.log("PendingOrder found:", pendingOrder ? "YES - " + pendingOrder.orderId : "NO")

      if (!pendingOrder) {
        const allPending = await PendingOrder.find({}).select("trackerToken orderId createdAt")
        console.log("All PendingOrders in DB:", JSON.stringify(allPending))
        return NextResponse.json({ received: true }, { status: 200 })
      }

      // Duplicate order nahi banana
      const existing = await Order.findOne({ "meta.orderId": pendingOrder.orderId })
      if (existing) {
        console.log("Duplicate - order already exists")
        await PendingOrder.deleteOne({ trackerToken })
        return NextResponse.json({ received: true }, { status: 200 })
      }

      const newOrder = await Order.create({
        user: pendingOrder.userId,
        items: pendingOrder.items,
        totalAmount: pendingOrder.totalAmount,
        paymentMethod: "online",
        address: pendingOrder.address,
        status: "pending",
        isPaid: true,
        meta: {
          orderId: pendingOrder.orderId,
          trackerToken,
        },
      })

      await PendingOrder.deleteOne({ trackerToken })
      console.log("✅ ORDER SAVED! _id:", newOrder._id.toString(), "user:", String(pendingOrder.userId))
    }

    // ==============================
    // ❌ PAYMENT FAILED
    // ==============================
    else if (eventType === "payment:failed") {
      const pendingOrder = await PendingOrder.findOne({ trackerToken })
      if (pendingOrder) {
        await Order.create({
          user: pendingOrder.userId,
          items: pendingOrder.items,
          totalAmount: pendingOrder.totalAmount,
          paymentMethod: "online",
          address: pendingOrder.address,
          status: "pending",
          isPaid: false,
          meta: { orderId: pendingOrder.orderId, trackerToken },
        })
        await PendingOrder.deleteOne({ trackerToken })
        console.log("❌ Failed order saved")
      }
    }

    // ==============================
    // ❌ PAYMENT CANCELLED
    // ==============================
    else if (eventType === "payment:cancelled") {
      await PendingOrder.deleteOne({ trackerToken })
      console.log("Cancelled - PendingOrder deleted")
    }

    else {
      console.log("Unknown event type received:", eventType)
      console.log("Full event:", JSON.stringify(event, null, 2))
    }

    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error: any) {
    console.error("=== WEBHOOK CRASH ===", error.message)
    console.error(error.stack)
    return NextResponse.json({ received: true }, { status: 200 })
  }
}