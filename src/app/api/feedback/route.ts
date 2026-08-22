import connectDb from "@/app/lib/db"
import Feedback from "@/app/Models/feedback.model"
import Order from "@/app/Models/order.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectDb()
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId")
    const groceryId = searchParams.get("groceryId")

    if (!sellerId && !groceryId) {
      return NextResponse.json({ message: "sellerId or groceryId required" }, { status: 400 })
    }

    const filter: any = {}
    if (sellerId) filter.seller = sellerId
    if (groceryId) filter.grocery = groceryId

    const feedbacks = await Feedback.find(filter)
      .populate("buyer", "name image")
      .sort({ createdAt: -1 })
      .limit(50)

    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0

    return NextResponse.json(
      { feedbacks, avgRating, count: feedbacks.length },
      { status: 200 }
    )
  } catch (error) {
    console.error("feedback GET error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderId, groceryId, rating, comment } = await request.json()

    const numRating = Number(rating)
    if (!orderId || !groceryId || !numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ message: "Invalid feedback data" }, { status: 400 })
    }
    if (comment && comment.length > 800) {
      return NextResponse.json({ message: "Comment too long" }, { status: 400 })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    // Security: sirf apne hi order par feedback de sakta hai, aur sirf delivered order par
    if (order.user.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    if (order.status !== "delivered") {
      return NextResponse.json(
        { message: "You can only review items after delivery" },
        { status: 400 }
      )
    }

    const item = (order.items as any[]).find((it) => it.grocery.toString() === groceryId)
    if (!item) {
      return NextResponse.json({ message: "Item not found in this order" }, { status: 404 })
    }
    if (!item.seller) {
      return NextResponse.json(
        { message: "This item does not belong to a marketplace seller" },
        { status: 400 }
      )
    }

    const feedback = await Feedback.create({
      order: orderId,
      grocery: groceryId,
      seller: item.seller,
      buyer: session.user.id,
      rating: numRating,
      comment: comment?.trim(),
    })

    item.feedbackGiven = true
    await order.save()

    return NextResponse.json(feedback, { status: 201 })
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "You have already reviewed this item" },
        { status: 400 }
      )
    }
    console.error("feedback POST error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
