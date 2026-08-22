import connectDb from "@/app/lib/db"
import Feedback from "@/app/Models/feedback.model"
import Grocery from "@/app/Models/grocery.model"
import User from "@/app/Models/user.model"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const { id } = await params

    const seller = await User.findOne({
      _id: id,
      sellerStatus: { $in: ["approved", "suspended"] },
    }).select("name image storeName createdAt sellerStatus")

    if (!seller) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 })
    }

    const products = await Grocery.find({ seller: id }).sort({ createdAt: -1 })
    // Seller ko jitne bhi feedback (kisi bhi product par) mile hon, sary k
    // sary yahan aa jayen — koi limit nahi
    const feedbacks = await Feedback.find({ seller: id })
      .populate("buyer", "name image")
      .sort({ createdAt: -1 })

    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0

    return NextResponse.json(
      {
        seller,
        products,
        feedbacks,
        avgRating,
        totalReviews: feedbacks.length,
        totalSold: products.length, // simple placeholder metric
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("public seller profile error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
