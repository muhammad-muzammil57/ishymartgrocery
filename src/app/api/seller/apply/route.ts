import uploadOnCloudinary from "@/app/lib/cloudinary"
import connectDb from "@/app/lib/db"
import { checkRateLimit, validateDocumentFile } from "@/app/lib/rateLimit"
import SellerApplication from "@/app/Models/sellerApplication.model"
import User from "@/app/Models/user.model"
import { auth } from "@/auth"
import { sendSellerApplicationReceivedEmail } from "@/app/lib/mailer"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectDb()

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Sirf normal "user" role selling apply kar sakta hai (admin/deliveryBoy nahi)
    const currentUser = await User.findById(session.user.id)
    if (!currentUser || currentUser.role !== "user") {
      return NextResponse.json(
        { message: "Only regular user accounts can apply to become a seller" },
        { status: 403 }
      )
    }

    if (currentUser.sellerStatus === "pending") {
      return NextResponse.json(
        { message: "You already have a pending seller application" },
        { status: 400 }
      )
    }
    if (currentUser.sellerStatus === "approved") {
      return NextResponse.json(
        { message: "You are already an approved seller" },
        { status: 400 }
      )
    }
    if (currentUser.sellerStatus === "suspended") {
      return NextResponse.json(
        { message: "Your seller account is suspended. Contact support." },
        { status: 403 }
      )
    }

    const { allowed } = await checkRateLimit(`seller-apply:${session.user.id}`, 3, 60 * 60)
    if (!allowed) {
      return NextResponse.json(
        { message: "Too many attempts. Please try again later." },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const fullName = (formData.get("fullName") as string || "").trim()
    const storeName = (formData.get("storeName") as string || "").trim()
    const address = (formData.get("address") as string || "").trim()
    const phone = (formData.get("phone") as string || "").trim()
    const bankDocumentFile = formData.get("bankDocument") as Blob | null
    const utilityBillFile = formData.get("utilityBill") as Blob | null
    const idDocumentFile = formData.get("idDocument") as Blob | null

    if (!fullName || !storeName || !address || !phone) {
      return NextResponse.json(
        { message: "Please fill in your name, store name, address and phone number" },
        { status: 400 }
      )
    }
    if (fullName.length > 120 || storeName.length > 120 || address.length > 500 || phone.length > 30) {
      return NextResponse.json({ message: "One of the fields is too long" }, { status: 400 })
    }

    for (const [file, label] of [
      [bankDocumentFile, "Bank document"],
      [utilityBillFile, "Electricity bill"],
      [idDocumentFile, "Identity/verification document"],
    ] as [Blob | null, string][]) {
      const err = validateDocumentFile(file, label)
      if (err) return NextResponse.json({ message: err }, { status: 400 })
    }

    const [bankDocument, utilityBill, idDocument] = await Promise.all([
      uploadOnCloudinary(bankDocumentFile as Blob),
      uploadOnCloudinary(utilityBillFile as Blob),
      uploadOnCloudinary(idDocumentFile as Blob),
    ])

    if (!bankDocument || !utilityBill || !idDocument) {
      return NextResponse.json(
        { message: "Failed to upload one or more documents, please try again" },
        { status: 500 }
      )
    }

    const application = await SellerApplication.create({
      user: currentUser._id,
      fullName,
      storeName,
      address,
      phone,
      bankDocument,
      utilityBill,
      idDocument,
      status: "pending",
    })

    currentUser.sellerStatus = "pending"
    currentUser.storeName = storeName
    await currentUser.save()

    sendSellerApplicationReceivedEmail(currentUser.email, currentUser.name).catch((err) =>
      console.error("seller application email error:", err)
    )

    return NextResponse.json(
      { message: "Application submitted", application },
      { status: 201 }
    )
  } catch (error) {
    console.error("seller apply error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
