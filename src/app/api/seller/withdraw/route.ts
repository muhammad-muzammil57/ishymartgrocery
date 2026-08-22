import connectDb from "@/app/lib/db"
import { checkRateLimit } from "@/app/lib/rateLimit"
import User from "@/app/Models/user.model"
import Withdrawal from "@/app/Models/withdrawal.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    // Approved wali requests seller ke page se ghaib ho jati hain (admin ke pass copy rehti hai)
    const withdrawals = await Withdrawal.find({
      seller: session.user.id,
      hiddenForSeller: { $ne: true },
    }).sort({ createdAt: -1 })

    return NextResponse.json(withdrawals, { status: 200 })
  } catch (error) {
    console.error("seller withdraw GET error:", error)
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

    const user = await User.findById(session.user.id)
    if (!user || user.sellerStatus !== "approved") {
      return NextResponse.json({ message: "You are not an approved seller" }, { status: 403 })
    }

    const { allowed } = await checkRateLimit(`seller-withdraw:${user._id}`, 5, 60 * 60)
    if (!allowed) {
      return NextResponse.json({ message: "Too many withdrawal attempts, try again later" }, { status: 429 })
    }

    const { amount } = await request.json()
    const numAmount = Number(amount)

    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    // Ek hi waqt mein aik pending withdrawal ho sakti hai
    const existingPending = await Withdrawal.findOne({ seller: user._id, status: "pending" })
    if (existingPending) {
      return NextResponse.json(
        { message: "You already have a pending withdrawal request" },
        { status: 400 }
      )
    }

    if (numAmount > (user.sellerBalance || 0)) {
      return NextResponse.json(
        { message: "Withdrawal amount exceeds your available balance" },
        { status: 400 }
      )
    }

    // Amount ko turant balance se reserve/deduct kar dete hain taake double-withdraw na ho sake;
    // reject hone par wapis add kar diya jayega.
    user.sellerBalance = (user.sellerBalance || 0) - numAmount
    await user.save()

    const withdrawal = await Withdrawal.create({
      seller: user._id,
      amount: numAmount,
      status: "pending",
    })

    return NextResponse.json(withdrawal, { status: 201 })
  } catch (error) {
    console.error("seller withdraw POST error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
