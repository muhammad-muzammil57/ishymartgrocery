// app/api/admin/setup-admin-credentials/route.ts
//
// ✅ MAIN NE YEH FILE BANAYI HAI
// Deploy ke baad kisi bhi email ko admin banana ke liye
// Postman ya browser se ek baar hit karo — ho gaya
//
// .env mein yeh line add karein:
// ADMIN_SETUP_SECRET=koi_bhi_lamba_secret_password_likho
//
// ═══════════════════════════════════════════════════════

import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { secretKey, email, username, password } = await req.json();

    // ── Secret key check ──────────────────────────────────────────
    // .env mein ADMIN_SETUP_SECRET jo bhi rakha hai wahi dena hoga
    if (!secretKey || secretKey !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json(
        { message: "Unauthorized — galat secret key" },
        { status: 401 }
      );
    }

    // ── Input validation ──────────────────────────────────────────
    if (!email || !username || !password) {
      return NextResponse.json(
        { message: "email, username aur password tینوں required hain" },
        { status: 400 }
      );
    }

    // ── User dhundo ───────────────────────────────────────────────
    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return NextResponse.json(
        { message: `Koi user nahi mila email: ${email}` },
        { status: 404 }
      );
    }

    // ── Admin credentials save karo ───────────────────────────────
    await User.findOneAndUpdate(
      { email: email.trim() },
      {
        adminCredentials: {
          username: username.trim(),
          password: password.trim(),
        },
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "✅ Admin credentials set ho gaye!",
        email: email.trim(),
        username: username.trim(),
       
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Server error: ${error}` },
      { status: 500 }
    );
  }
}
