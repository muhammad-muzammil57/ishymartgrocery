import connectDb from "@/app/lib/db";
import User from "@/app/Models/user.model";
import Otp from "@/app/Models/otp.model";
import { generateOtp } from "@/app/lib/mailer";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ─── Transporter (ek baar banao, dono functions use karein) ──────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASS,
    },
  });
}

// ─── Function 1: OTP Email (Password Reset Request) ──────────────────────────
async function sendForgotPasswordOtp(email: string, otp: string, name: string) {
  const transporter = createTransporter();

  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">🛒 IshyMart</h1>
      <p style="margin:6px 0 0;color:#bbf7d0;font-size:13px;">Fresh groceries delivered to your door</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#dc2626;margin:0 0 8px;">🔑 Password Reset</h2>
      <p style="color:#4b5563;margin:0 0 20px;line-height:1.6;">
        Assalam o Alaikum <strong>${name}</strong>! Aapne password reset request ki hai.<br/>
        Neeche diya OTP use karke apna naya password set karein.
      </p>
      <div style="background:#fef2f2;border:2px dashed #fca5a5;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Password Reset OTP</p>
        <span style="font-size:42px;font-weight:800;letter-spacing:14px;color:#dc2626;">${otp}</span>
      </div>
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:12px;">
        <p style="margin:0;color:#92400e;font-size:13px;">⏰ Yeh OTP <strong>10 minutes</strong> tak valid hai. Kisi ke saath share na karein.</p>
      </div>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;">
        <p style="margin:0;color:#991b1b;font-size:13px;">⚠️ Agar aapne yeh request nahi ki toh is email ko ignore karein. Aapka account safe hai.</p>
      </div>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} IshyMart — Sab rights reserved</p>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "IshyMart – Password Reset OTP 🔑",
    html,
  });
}

// ─── Function 2: Confirmation Email (Password Successfully Reset) ─────────────
// Yeh function apne reset-password route mein call karein jab password
// successfully update ho jaye.
export async function sendPasswordResetConfirmation(email: string, name: string) {
  const transporter = createTransporter();

  const resetTime = new Date().toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    dateStyle: "long",
    timeStyle: "short",
  });

  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">🛒 IshyMart</h1>
      <p style="margin:6px 0 0;color:#bbf7d0;font-size:13px;">Fresh groceries delivered to your door</p>
    </div>

    <!-- Success Banner -->
    <div style="background:#dcfce7;border-bottom:1px solid #bbf7d0;padding:16px 32px;text-align:center;">
      <p style="margin:0;color:#15803d;font-size:15px;font-weight:700;">✅ Aapka password successfully reset ho gaya!</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#4b5563;margin:0 0 20px;line-height:1.6;font-size:14px;">
        Assalam o Alaikum <strong>${name}</strong>,<br/>
        Aapke IshyMart account ka password successfully update kar diya gaya hai.
      </p>

      <!-- Info Box -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0 0 8px;color:#166534;font-size:13px;font-weight:600;">📋 Reset Details</p>
        <table style="width:100%;font-size:13px;color:#4b5563;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#6b7280;">Account:</td>
            <td style="padding:4px 0;font-weight:600;">${email}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;">Reset time:</td>
            <td style="padding:4px 0;font-weight:600;">${resetTime} (PKT)</td>
          </tr>
        </table>
      </div>

      <!-- Warning -->
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;margin-bottom:12px;">
        <p style="margin:0 0 6px;color:#991b1b;font-size:13px;font-weight:700;">⚠️ Yeh aap nahi thay?</p>
        <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.5;">
          Agar aapne yeh password reset nahi kiya toh foran apna account secure karein:<br/>
          • Dobara password reset karein<br/>
          • Hamare support se rabta karein
        </p>
      </div>

      <!-- Security Tips -->
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;">
        <p style="margin:0 0 6px;color:#92400e;font-size:13px;font-weight:700;">🔒 Security Tips</p>
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
          • Apna password kisi ke saath share na karein<br/>
          • Har jagah alag alag password use karein<br/>
          • Strong password rakhen (numbers + symbols + letters)
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:12px;">Koi masla? Hamare support se rabta karein</p>
      <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} IshyMart — Sab rights reserved</p>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "IshyMart – Password Successfully Reset ✅",
    html,
  });
}

// ─── POST Handler: OTP bhejne ka route ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email daalna zaroori hai!" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Agar yeh email registered hai toh OTP bhej diya jayega." },
        { status: 200 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { message: "Yeh account Google se linked hai. Google se login karein." },
        { status: 400 }
      );
    }

    await Otp.deleteMany({ email, type: "login" });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({ email, otp, type: "login", expiresAt });
    await sendForgotPasswordOtp(email, otp, user.name);

    return NextResponse.json(
      { message: "OTP bhej diya gaya! Email check karein." },
      { status: 200 }
    );
  } catch (error) {
    console.error("forgot-password error:", error);
    return NextResponse.json({ message: "Server error. Dobara try karein." }, { status: 500 });
  }
}
