// src/app/robots.ts
//
// https://yoursite.com/robots.txt — Google ko batata hai ke products (/mat/)
// aur stores (/imu/) crawl karne allowed hain, aur sitemap kahan hai.
import type { MetadataRoute } from "next"

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://ishymart-grocery.vercel.app").replace(/\/$/, "")

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/mat/", "/imu/", "/search"],
        disallow: [
          "/api/",
          "/admin/",
          "/user/",
          "/seller/apply",
          "/seller/pending",
          "/seller/dashboard",
          "/seller/orders",
          "/seller/withdrawals",
          "/settings",
          "/login",
          "/register",
          "/forgot-password",
          "/payment",
          "/unauthorized",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
