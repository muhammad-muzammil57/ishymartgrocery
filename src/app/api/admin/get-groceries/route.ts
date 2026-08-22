import connectDb from "@/app/lib/db"
import Grocery from "@/app/Models/grocery.model"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Admin ke "View Grocery" page ke liye — is mein sab groceries aati hain,
// chahe woh khud admin (IshyMart) ne lagayi hon ya kisi bhi seller ne. Har
// grocery ke sath "seller" populate hota hai (name/storeName), agar seller
// null hai to iska matlab yeh admin ka apna product hai.
export async function GET() {
  try {
    await connectDb()
    const session = await auth()
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const groceries = await Grocery.find({})
      .populate("seller", "name storeName image")
      .sort({ createdAt: -1 })

    return NextResponse.json(groceries, { status: 200 })
  } catch (error) {
    console.error("get-groceries error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
