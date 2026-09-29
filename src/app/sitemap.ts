// src/app/sitemap.ts
//
// Google (aur Bing) ke liye dynamic sitemap: https://yoursite.com/sitemap.xml
// Yeh Next.js ka built-in sitemap route hai — koi cron ya manual step nahi
// chahiye. Jab bhi Google ismein aakar dobara check karega (Search Console
// mein ek dafa submit karne ke baad Google khud periodically dobara crawl
// karta rehta hai), usay HAMESHA us waqt ke saare products aur stores milenge
// — chahe woh admin ne add kiye hon ya kisi seller ne, aur chahe kitne bhi
// naye add ho chuke hon. Kisi naye product/store ke liye code mein kuch
// badalne ki zaroorat nahi.
import connectDb from "@/app/lib/db"
import Grocery from "@/app/Models/grocery.model"
import User from "@/app/Models/user.model"
import type { MetadataRoute } from "next"

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://ishymart-grocery.vercel.app").replace(/\/$/, "")

// Sitemap ko har request par bilkul fresh generate mat karo (DB par load kam
// karne ke liye) — 1 ghante tak cache rehta hai, phir khud-ba-khud refresh.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDb()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.5 },
    { url: `${SITE_URL}/seller/apply`, changeFrequency: "monthly", priority: 0.3 },
  ]

  const [products, sellers] = await Promise.all([
    Grocery.find({ productNumber: { $exists: true } })
      .select("productNumber updatedAt")
      .lean(),
    User.find({
      storeSlug: { $exists: true },
      sellerStatus: { $in: ["approved", "suspended"] },
    })
      .select("storeSlug updatedAt")
      .lean() as unknown as Promise<{ storeSlug: string; updatedAt?: Date }[]>,
  ])

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/mat/${p.productNumber}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const storeRoutes: MetadataRoute.Sitemap = sellers.map((s) => ({
    url: `${SITE_URL}/imu/${s.storeSlug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...storeRoutes]
}
