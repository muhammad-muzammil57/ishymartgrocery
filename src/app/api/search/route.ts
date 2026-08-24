// src/app/api/search/route.ts
//
// Navbar search bar ke liye — pehle yeh bilkul kaam nahi karta tha (koi
// state, koi API, kuch nahi tha). Ab yeh:
//   1) Groceries (products) mein case-insensitive partial match karta hai
//      naam aur category dono par (e.g. "atta" likhein to "Atta" wala
//      product mil jayega, chahay match beech mein kahin bhi ho).
//   2) Approved sellers (store) mein bhi match karta hai (store name ya
//      seller ka apna naam), taa k seller ki profile par ja saken.
//
// GET /api/search?q=atta&limit=6
import connectDb from "@/app/lib/db"
import Grocery from "@/app/Models/grocery.model"
import User from "@/app/Models/user.model"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    const limit = Math.min(Number(searchParams.get("limit")) || 8, 50)

    if (!q) {
      return NextResponse.json({ products: [], sellers: [] }, { status: 200 })
    }

    await connectDb()

    // Regex special characters escape karo taa k user "a+b" jaisa kuch
    // type kare to crash na ho
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(safe, "i")

    const [products, sellers] = await Promise.all([
      Grocery.find({ $or: [{ name: regex }, { category: regex }] })
        .populate("seller", "name storeName image")
        .limit(limit)
        .sort({ createdAt: -1 }),

      User.find({
        isSeller: true,
        sellerStatus: "approved",
        $or: [{ storeName: regex }, { name: regex }],
      })
        .select("name storeName image")
        .limit(limit),
    ])

    return NextResponse.json({ products, sellers }, { status: 200 })
  } catch (error) {
    console.error("search error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
