// src/app/api/support/upload/route.ts
// Yeh naya file hai — file upload ke liye

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "File nahi mili" }, { status: 400 })
    }

    // 5MB limit check
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File 5MB se badi hai" }, { status: 400 })
    }

    // File ko buffer mein convert karo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Cloudinary pe upload karo
    const uploadResult = await new Promise<{
      secure_url: string
      original_filename: string
      resource_type: string
      format: string
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "ishymart-support",
            resource_type: "auto",
            use_filename: true,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result as any)
          }
        )
        .end(buffer)
    })

    return NextResponse.json({
      fileUrl: uploadResult.secure_url,
      fileName: file.name,
      fileType: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: `Upload fail: ${error}` }, { status: 500 })
  }
}
