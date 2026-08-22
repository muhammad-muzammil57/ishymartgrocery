import connectDb from "@/app/lib/db"
import Grocery from "@/app/Models/grocery.model"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const product = await Grocery.findById(id)
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }
    // Security: ek seller sirf apne hi products delete kar sakta hai
    if (!product.seller || product.seller.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await Grocery.findByIdAndDelete(id)
    return NextResponse.json({ message: "Product deleted" }, { status: 200 })
  } catch (error) {
    console.error("seller product DELETE error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
