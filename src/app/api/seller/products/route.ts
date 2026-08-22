import uploadOnCloudinary from "@/app/lib/cloudinary"
import connectDb from "@/app/lib/db"
import { checkRateLimit } from "@/app/lib/rateLimit"
import Grocery from "@/app/Models/grocery.model"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

async function requireApprovedSeller() {
  const session = await auth()
  if (!session?.user?.id) return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) }
  const user = await User.findById(session.user.id)
  if (!user || user.sellerStatus !== "approved") {
    return { error: NextResponse.json({ message: "You are not an approved seller" }, { status: 403 }) }
  }
  return { user }
}

export async function GET() {
  try {
    await connectDb()
    const { user, error } = await requireApprovedSeller()
    if (error) return error

    const products = await Grocery.find({ seller: user!._id }).sort({ createdAt: -1 })
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("seller products GET error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDb()
    const { user, error } = await requireApprovedSeller()
    if (error) return error

    const { allowed } = await checkRateLimit(`seller-add-product:${user!._id}`, 30, 60 * 60)
    if (!allowed) {
      return NextResponse.json({ message: "Too many requests, slow down" }, { status: 429 })
    }

    const formData = await request.formData()
    const name = (formData.get("name") as string || "").trim()
    const price = (formData.get("price") as string || "").trim()
    const unit = formData.get("unit") as string
    const category = formData.get("category") as string
    const file = formData.get("image") as Blob | null

    if (!name || !price || !unit || !category) {
      return NextResponse.json({ message: "Please fill all fields" }, { status: 400 })
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json({ message: "Invalid price" }, { status: 400 })
    }

    let imageUrl
    if (file) imageUrl = await uploadOnCloudinary(file)

    const product = await Grocery.create({
      name,
      price,
      unit,
      category,
      image: imageUrl || "",
      seller: user!._id,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("seller products POST error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
