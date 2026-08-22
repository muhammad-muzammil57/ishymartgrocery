import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,       // aapki gmail
    pass: process.env.EMAIL_APP_PASS,   // Gmail App Password (16-digit)
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit:true
} as any);

function emailWrapper(bodyHtml: string) {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">🛒 IshyMart</h1>
      <p style="margin:6px 0 0;color:#bbf7d0;font-size:13px;">Fresh groceries delivered to your door</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      ${bodyHtml}
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        © ${new Date().getFullYear()} IshyMart — All rights reserved
      </p>
      <p style="margin:6px 0 0;color:#d1fae5;font-size:11px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ishymart.com'}" style="color:#16a34a;text-decoration:none;">ishymart.com</a>
        &nbsp;·&nbsp;
        <a href="mailto:${process.env.EMAIL_USER}" style="color:#16a34a;text-decoration:none;">Support</a>
      </p>
    </div>
  </div>
  `;
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  type: "register" | "login"
) {
  const subject =
    type === "register"
      ? "IshyMart – Verify your email to complete registration"
      : "IshyMart – Your login OTP";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="color:#15803d;margin-bottom:4px;">
        ${type === "register" ? "Complete Your Registration" : "Login Verification"}
      </h2>
      <p style="color:#4b5563;margin-bottom:24px;">
        ${
          type === "register"
            ? "Thanks for signing up to IshyMart! Use the OTP below to verify your email."
            : "Someone tried to log in to your IshyMart account. Use the OTP below to confirm it's you."
        }
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:24px;text-align:center;">
        <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#15803d;">${otp}</span>
      </div>
      <p style="color:#6b7280;font-size:13px;margin-top:20px;">
        This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="color:#9ca3af;font-size:12px;">IshyMart — Fresh groceries delivered to your door 🛒</p>
    </div>
  `;

  await transporter.sendMail({
    headers:{
      "X-Priority": "1 (Highest)",
      "X-MSMail-Priority": "High",
      "Importance": "High",
      "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`
    },
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const subject = "Wellcome In IshyMart! 🎉";

  const body = `
    <h2 style="color:#15803d;margin:0 0 8px;">Assalam o Alaikum, ${name}! 👋</h2>
    <p style="color:#4b5563;margin:0 0 20px;line-height:1.6;">
      Wellcome to the IshyMart family! We are delighted to have you with us.
    </p>

    <!-- Features -->
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 14px;color:#15803d;font-weight:700;font-size:15px;">You can now:</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:#374151;font-size:14px;">🛒</td>
          <td style="padding:6px 8px;color:#374151;font-size:14px;">Order Your Favourite Items From Thousands Of Products</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#374151;font-size:14px;">🚴</td>
          <td style="padding:6px 8px;color:#374151;font-size:14px;">Get Delivery At Your Doorstep</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#374151;font-size:14px;">💰</td>
          <td style="padding:6px 8px;color:#374151;font-size:14px;">Enjoy Special Offers and Discounts</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#374151;font-size:14px;">📦</td>
          <td style="padding:6px 8px;color:#374151;font-size:14px;">Track Your Orders In Real Time</td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ishymart.com'}"
        style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
        Start Shopping Here →
      </a>
    </div>

    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
      If you have any questions, feel free to 
      <a href="mailto:${process.env.EMAIL_USER}" style="color:#16a34a;">email</a> us.
      We are always here to help! 😊
    </p>
  `;

  await transporter.sendMail({
    headers:{
      "X-Priority": "1 (Highest)",
      "X-MSMail-Priority": "High",
      "Importance": "High",
      "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`
    },
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailWrapper(body),
  });
}

// ─── Login notification email ─────────────────────────
export async function sendLoginNotificationEmail(
  to: string,
  name: string
) {
  const now = new Date();
  const timeString = now.toLocaleString("en-us", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const subject = "IshyMart – Successful Login ✅";

  const body = `
    <h2 style="color:#15803d;margin:0 0 8px;">Login Successfull! ✅</h2>
    <p style="color:#4b5563;margin:0 0 20px;line-height:1.6;">
      Assalam o Alaikum <strong>${name}</strong>, Your IshyMart account has been logedin successfuly.
    </p>

    <!-- Login details -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;color:#374151;font-weight:600;font-size:14px;">Login Details:</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:5px 0;color:#6b7280;font-size:13px;width:40%;">📅 Time:</td>
          <td style="padding:5px 0;color:#374151;font-size:13px;font-weight:500;">${timeString}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#6b7280;font-size:13px;">📧 Email:</td>
          <td style="padding:5px 0;color:#374151;font-size:13px;font-weight:500;">${to}</td>
        </tr>
      </table>
    </div>

    <!-- Warning -->
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
      <p style="margin:0;color:#991b1b;font-size:13px;">
        ⚠️ If You Didnot Log in to this Account <strong>Please Change Your Password Immediately</strong>
        Or Contact To Our Support Team.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ishymart.com'}/settings"
        style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:600;font-size:14px;">
        Open Account Settings
      </a>
    </div>
  `;

  await transporter.sendMail({
    headers:{
      "X-Priority": "1 (Highest)",
      "X-MSMail-Priority": "High",
      "Importance": "High",
      "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`
    },
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailWrapper(body),
  });
}

export async function sendAdminOtpEmail(
  to: string,
  name: string,
  otp: string
) {
  const subject = "IshyMart – Admin Panel Access OTP 🔐";

  const body = `
    <h2 style="color:#15803d;margin:0 0 8px;">Admin Panel Access 🔐</h2>
    <p style="color:#4b5563;margin:0 0 20px;line-height:1.6;">
      Assalam o Alaikum <strong>${name}</strong>, aapne Admin Panel access karne ki koshish ki hai.
      Neeche diya gaya OTP use karein — sirf <strong>5 minute</strong> ke liye valid hai.
    </p>

    <!-- OTP Box -->
    <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#15803d;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Admin OTP</p>
      <span style="font-size:42px;font-weight:800;letter-spacing:14px;color:#15803d;">${otp}</span>
    </div>

    <!-- Warning -->
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
      <p style="margin:0;color:#991b1b;font-size:13px;">
        ⚠️ Agar aapne yeh request nahi ki to <strong>kisi ko bhi yeh OTP mat batayein</strong>
        aur foran apna password change karein.
      </p>
    </div>

    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
      Yeh OTP 5 minute mein automatically expire ho jayega.
    </p>
  `;

  await transporter.sendMail({
    headers:{
      "X-Priority": "1 (Highest)",
      "X-MSMail-Priority": "High",
      "Importance": "High",
      "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`
    },
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailWrapper(body),
  });
}

// ─── Seller application submitted (confirmation to applicant) ─────────────
export async function sendSellerApplicationReceivedEmail(to: string, name: string) {
  const subject = "IshyMart – Seller Application Received 📝";
  const body = `
    <h2 style="color:#15803d;margin:0 0 8px;">Application Received! 📝</h2>
    <p style="color:#4b5563;margin:0 0 20px;line-height:1.6;">
      Assalam o Alaikum <strong>${name}</strong>, aapki seller banne ki request humein mil chuki hai.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:16px;">
      <p style="margin:0;color:#166534;font-size:14px;">
        Hamari team aapke documents verify karegi. Yeh process <strong>3 se 4 din</strong> mein mukammal ho jata hai.
      </p>
    </div>
    <p style="color:#6b7280;font-size:13px;">Aap apna status app mein "Selling Account" page par kabhi bhi dekh sakte hain.</p>
  `;
  await transporter.sendMail({
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailWrapper(body),
  });
}

// ─── Seller application approved / rejected ────────────────────────────────
export async function sendSellerApplicationDecisionEmail(
  to: string,
  name: string,
  approved: boolean,
  reason?: string
) {
  const subject = approved
    ? "IshyMart – Congratulations! Your Seller Account is Approved 🎉"
    : "IshyMart – Seller Application Update";

  const body = approved
    ? `
      <h2 style="color:#15803d;margin:0 0 8px;">Mubarak ho, ${name}! 🎉</h2>
      <p style="color:#4b5563;margin:0 0 20px;line-height:1.6;">
        Aapki seller account request <strong>approve</strong> ho chuki hai. Ab aap IshyMart par apne products list kar sakte hain.
      </p>
      <div style="text-align:center;margin-bottom:8px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://ishymart.com"}/seller/dashboard"
          style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:600;font-size:14px;">
          Selling Shuru Karein →
        </a>
      </div>
    `
    : `
      <h2 style="color:#dc2626;margin:0 0 8px;">Application Approve Nahi Ho Saki</h2>
      <p style="color:#4b5563;margin:0 0 16px;line-height:1.6;">
        Assalam o Alaikum <strong>${name}</strong>, mutasaffiran humein aapki seller request approve karne mein mushkil hui.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
        <p style="margin:0;color:#991b1b;font-size:13px;"><strong>Wajah:</strong> ${reason || "Not specified"}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;">Aap apne documents theek kar ke dobara apply kar sakte hain.</p>
    `;

  await transporter.sendMail({
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailWrapper(body),
  });
}

// ─── Withdrawal decision email ─────────────────────────────────────────────
export async function sendWithdrawalDecisionEmail(
  to: string,
  name: string,
  approved: boolean,
  amount: number,
  reason?: string
) {
  const subject = approved
    ? "IshyMart – Withdrawal Approved ✅"
    : "IshyMart – Withdrawal Request Rejected";

  const body = approved
    ? `
      <h2 style="color:#15803d;margin:0 0 8px;">Withdrawal Approved ✅</h2>
      <p style="color:#4b5563;margin:0 0 16px;line-height:1.6;">
        Assalam o Alaikum <strong>${name}</strong>, aapki <strong>Rs ${amount}</strong> ki withdrawal request approve kar di gayi hai aur process ho chuki hai.
      </p>
    `
    : `
      <h2 style="color:#dc2626;margin:0 0 8px;">Withdrawal Rejected</h2>
      <p style="color:#4b5563;margin:0 0 16px;line-height:1.6;">
        Assalam o Alaikum <strong>${name}</strong>, aapki <strong>Rs ${amount}</strong> ki withdrawal request reject kar di gayi hai.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
        <p style="margin:0;color:#991b1b;font-size:13px;"><strong>Wajah:</strong> ${reason || "Not specified"}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;">Yeh amount aapke balance mein wapis add kar diya gaya hai.</p>
    `;

  await transporter.sendMail({
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailWrapper(body),
  });
}

// ─── Seller account suspended ──────────────────────────────────────────────
export async function sendSellerSuspendedEmail(to: string, name: string, reason: string) {
  const subject = "IshyMart – Your Seller Account Has Been Suspended";
  const body = `
    <h2 style="color:#dc2626;margin:0 0 8px;">Seller Account Suspended</h2>
    <p style="color:#4b5563;margin:0 0 16px;line-height:1.6;">
      Assalam o Alaikum <strong>${name}</strong>, aapka seller account suspend kar diya gaya hai. Aap ab products sell nahi kar sakte.
      Aapka buyer account normal tarha kaam karta rahega.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
      <p style="margin:0;color:#991b1b;font-size:13px;"><strong>Wajah:</strong> ${reason}</p>
    </div>
    <p style="color:#6b7280;font-size:13px;">Agar aapko lagta hai yeh ghalti se hua hai to support se rabta karein.</p>
  `;
  await transporter.sendMail({
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailWrapper(body),
  });
}

// ─── Delivery confirmation OTP ─────────────────────────────────────────────
export async function sendDeliveryOtpEmail(to: string, name: string, otp: string, orderId: string) {
  const subject = "IshyMart – Your Delivery Confirmation Code 📦";
  const body = `
    <h2 style="color:#15803d;margin:0 0 8px;">Your Order is Almost There! 📦</h2>
    <p style="color:#4b5563;margin:0 0 16px;line-height:1.6;">
      Assalam o Alaikum <strong>${name}</strong>, aapka delivery partner order
      <strong>#${orderId.slice(-6)}</strong> lekar pohanch chuka hai. Order receive karte waqt
      neeche diya gaya code delivery partner ko batayein.
    </p>
    <div style="text-align:center;margin:20px 0;">
      <span style="display:inline-block;background:#f0fdf4;border:2px dashed #16a34a;color:#15803d;font-size:28px;font-weight:800;letter-spacing:6px;padding:14px 28px;border-radius:12px;">
        ${otp}
      </span>
    </div>
    <p style="color:#6b7280;font-size:13px;">Yeh code sirf aap ko pata hona chahiye — kisi aur ko na batayein. Yeh 15 minutes mein expire ho jayega.</p>
  `;
  await transporter.sendMail({
    from: `"IshyMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailWrapper(body),
  });
}

// ─── Admin Login Notification ─────────────────────────────────────────────────
export async function sendAdminLoginNotification(
  adminEmail: string,
  adminName: string,
  ip: string,
  device: string,
  browser: string
) {
  const NOTIFY_EMAIL = "asadpkonoff@gmail.com";

  const loginTime = new Date().toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    dateStyle: "full",
    timeStyle: "medium",
  });

  const body = `
    <h2 style="color:#dc2626;margin:0 0 8px;">🚨 Admin Panel Access Alert</h2>
    <p style="color:#4b5563;margin:0 0 20px;line-height:1.6;">
      Kisi ne IshyMart Admin Panel successfully access kiya hai. Neeche poori details hain:
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 14px;color:#991b1b;font-weight:700;font-size:14px;">🔐 Login Details</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;width:38%;">👤 Admin Name:</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;">${adminName}</td>
        </tr>
        <tr style="background:#fff5f5;border-radius:4px;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">📧 Admin Email:</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;">${adminEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">📅 Time (PKT):</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;">${loginTime}</td>
        </tr>
        <tr style="background:#fff5f5;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">🌐 IP Address:</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;">${ip}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">💻 Device:</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;">${device}</td>
        </tr>
        <tr style="background:#fff5f5;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">🌍 Browser:</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;">${browser}</td>
        </tr>
      </table>
    </div>

    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
      <p style="margin:0;color:#92400e;font-size:13px;">
        ⚠️ Agar yeh access authorized nahi tha, toh <strong>foran admin credentials change karein</strong>
        aur suspicious activity ke liye account check karein.
      </p>
    </div>

    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
      Yeh ek automated security alert hai — IshyMart Security System
    </p>
  `;

  await transporter.sendMail({
    headers:{
      "X-Priority": "1 (Highest)",
      "X-MSMail-Priority": "High",
      "Importance": "High",
      "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`
    },
    from: `"IshyMart Security" <${process.env.EMAIL_USER}>`,
    to: NOTIFY_EMAIL,
    subject: `🚨 Admin Login — ${adminName} | ${loginTime}`,
    html: emailWrapper(body),
  });
}