import connectDb from "@/app/lib/db"
import Order from "@/app/Models/order.model"
import OrderChat from "@/app/Models/orderChat.model"
import { auth } from "@/auth"
import { emitSocketEvent } from "@/app/lib/emitSocketEvent"
import { NextRequest, NextResponse } from "next/server"

async function authorizeChatAccess(orderId: string, userId: string) {
  const order = await Order.findById(orderId)
  if (!order) return { error: NextResponse.json({ message: "Order not found" }, { status: 404 }) }

  const isBuyer = order.user.toString() === userId
  const isDeliveryBoy = order.assignedDeliveryBoy?.toString() === userId
  if (!isBuyer && !isDeliveryBoy) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) }
  }
  return { order, role: isBuyer ? ("buyer" as const) : ("deliveryBoy" as const) }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const { orderId } = await params
    const { error } = await authorizeChatAccess(orderId, session.user.id)
    if (error) return error

    const chat = await OrderChat.findOne({ order: orderId })
    return NextResponse.json({ messages: chat?.messages || [] }, { status: 200 })
  } catch (error) {
    console.error("order chat GET error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const { orderId } = await params
    const { error, role } = await authorizeChatAccess(orderId, session.user.id)
    if (error) return error

    const { text } = await request.json()
    if (!text || !text.trim()) {
      return NextResponse.json({ message: "Message cannot be empty" }, { status: 400 })
    }
    if (text.length > 1000) {
      return NextResponse.json({ message: "Message too long" }, { status: 400 })
    }

    const message = {
      sender: role!,
      senderId: session.user.id,
      text: text.trim(),
      createdAt: new Date(),
    }

    const chat = await OrderChat.findOneAndUpdate(
      { order: orderId },
      { $push: { messages: message } },
      { upsert: true, new: true }
    )

    // ─── Real-time: dusri taraf (buyer <-> delivery boy) ko turant naya
    // message mil jaye — ab yahan koi 4-second polling nahi ─────────────
    await emitSocketEvent(`order:${orderId}`, "order:chatMessage", message)

    return NextResponse.json({ messages: chat.messages }, { status: 201 })
  } catch (error) {
    console.error("order chat POST error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
