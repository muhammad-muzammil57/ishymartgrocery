// app/api/payment/create-session/route.ts
import { NextRequest, NextResponse } from "next/server"
import { Safepay } from "@sfpy/node-sdk"
import dbConnect from "@/app/lib/db"
import PendingOrder from "@/app/Models/PendingOrder"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

function getSafepay() {
  return new Safepay({
    environment: "sandbox", // production mein "production" karo
    apiKey: process.env.SAFEPAY_API_KEY!,
    v1Secret: process.env.SAFEPAY_SECRET_KEY!,
    webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET!,
  } as any)
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const { cartData, userData, address, position } = body

    // ✅ Server side amount calculate karo - client pe trust mat karo
    if (!cartData || !Array.isArray(cartData) || cartData.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const subTotal: number = cartData.reduce(
      (total: number, item: any) => total + Number(item.price) * Number(item.quantity),
      0
    )
    const deliveryFee: number = subTotal > 1000 ? 0 : 100
    const totalAmount: number = subTotal + deliveryFee

    // ✅ SafePay payment token create karo
    const safepay = getSafepay()
    const { token } = await safepay.payments.create({
      amount: totalAmount,
      currency: "PKR",
    })

    // ✅ Unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // ✅ Pending order database mein save karo
    await PendingOrder.create({
      orderId,
      trackerToken: token,
      userId: userData?._id || undefined,
      items: cartData.map((item: any) => ({
        grocery: item._id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount,
      address: {
        fullName: address?.fullName || "",
        mobile: address?.mobile || "",
        city: address?.city || "",
        state: address?.state || "",
        pincode: address?.postalCode || "",
        fullAddress: address?.fullAddress || "",
        latitude: position?.[0] || 0,
        longitude: position?.[1] || 0,
      },
    })

    // ✅ SafePay checkout URL banao
    const checkoutUrl = safepay.checkout.create({
      token,
      orderId,
      cancelUrl: `${APP_URL}/payment/cancelled?orderId=${orderId}`,
      redirectUrl: `${APP_URL}/payment/success?orderId=${orderId}&token=${token}`,
      source: "custom",
      webhooks: true,
    })

    return NextResponse.json({
      success: true,
      checkoutUrl,
      orderId,
      token,
    })
  } catch (error: any) {
    console.error("[CREATE-SESSION ERROR]", error.message)
    return NextResponse.json({ error: "Payment session create karne mein masla hua" }, { status: 500 })
  }
}
