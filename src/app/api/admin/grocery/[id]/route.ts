// src/app/api/admin/grocery/[id]/route.ts
//
// Admin ke "View Grocery" page ke liye — ab admin KISI BHI grocery item
// ko (chahe admin ne khud lagaya ho ya kisi seller ne) edit (PATCH) ya
// delete (DELETE) kar sakta hai.
import uploadOnCloudinary from "@/app/lib/cloudinary"
import connectDb from "@/app/lib/db"
import Grocery from "@/app/Models/grocery.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "admin") {
    return null
  }
  return session
}

// ─── UPDATE (edit) ────────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const grocery = await Grocery.findById(id)
    if (!grocery) {
      return NextResponse.json({ message: "Grocery item not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string | null
    const price = formData.get("price") as string | null
    const unit = formData.get("unit") as string | null
    const category = formData.get("category") as string | null
    const file = formData.get("image") as Blob | null

    if (name) grocery.name = name
    if (price) grocery.price = price
    if (unit) grocery.unit = unit
    if (category) grocery.category = category

    // Nayi image sirf tab upload hogi jab admin ne koi nayi file select ki ho
    if (file && (file as any).size > 0) {
      const imageUrl = await uploadOnCloudinary(file)
      if (imageUrl) grocery.image = imageUrl
    }

    await grocery.save()

    const populated = await Grocery.findById(id).populate("seller", "name storeName image")

    return NextResponse.json(populated, { status: 200 })
  } catch (error) {
    console.error("Error updating grocery item:", error)
    return NextResponse.json({ message: "Failed to update grocery item" }, { status: 500 })
  }
}

// ─── DELETE ────────────────────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const grocery = await Grocery.findByIdAndDelete(id)
    if (!grocery) {
      return NextResponse.json({ message: "Grocery item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Grocery item deleted", id }, { status: 200 })
  } catch (error) {
    console.error("Error deleting grocery item:", error)
    return NextResponse.json({ message: "Failed to delete grocery item" }, { status: 500 })
  }
}
