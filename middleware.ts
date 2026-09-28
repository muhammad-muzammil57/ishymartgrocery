import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Payment pages public hain
  // ⚠️ SECURITY FIX: "/admin/livechat" yahan se HATA diya gaya hai — pehle
  // yeh route bilkul public tha (login check bhi skip hota tha), matlab
  // roomId link milte hi koi bhi (bina login) "admin" ban kar customer se
  // chat kar sakta tha. Ab yeh normal "/admin/*" flow follow karega:
  // login + role==="admin" zaroori (neeche wala generic check). Extra
  // security (emailed code) khud page/API level par hai.
  if (
    pathname.startsWith("/payment/success") ||
    pathname.startsWith("/payment/cancelled") ||
    pathname.startsWith("/api/payment/webhook")
  ) {
    return NextResponse.next()
  }

  // Public routes
  const publicRoutes = ["/login", "/register", "/api/auth", "/forgot-password"]
  if (publicRoutes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Token nikalo (production mein cookieName explicitly dena zaroori hai)
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  })

  // Guest (bina login) ke liye open pages: home (products), cart, checkout,
  // search, seller public profile aur legal pages. Order place karte waqt
  // login mangta hai (checkout page + /api/user/order server par check).
  const sellerPrivate = ["/seller/apply", "/seller/pending", "/seller/orders", "/seller/dashboard", "/seller/withdrawals"]
  const isGuestAllowed =
    pathname === "/" ||
    pathname === "/user/cart" ||
    pathname === "/user/checkout" ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/mat/") ||
    pathname.startsWith("/imu/") ||
    pathname.startsWith("/legal") ||
    (/^\/seller\/[^/]+$/.test(pathname) && !sellerPrivate.includes(pathname))

  if (!token) {
    if (isGuestAllowed) return NextResponse.next()
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackURL", req.url)
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role

  if (pathname.startsWith("/user") && role !== "user") {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }
  if (pathname.startsWith("/delivery") && role !== "deliveryBoy") {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/payment/:path*",
    "/api/payment/webhook",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
