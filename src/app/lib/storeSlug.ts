// src/app/lib/storeSlug.ts
//
// Har approved seller ke store ko ek unique public URL milta hai:
//   /imu/<store-name>      (e.g. "Ali General Store" -> /imu/ali-general-store)
// Agar 2 stores ka naam same ho to dusre ke aage number lag jata hai
// (ali-general-store-2).
import mongoose from "mongoose"
import User from "@/app/Models/user.model"

export function slugifyStoreName(name: string): string {
  const slug = (name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "")
  return slug || "store"
}

export async function generateUniqueStoreSlug(storeName: string, excludeUserId?: mongoose.Types.ObjectId | string): Promise<string> {
  const base = slugifyStoreName(storeName)
  let candidate = base
  let n = 2
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const taken = await User.findOne({
      storeSlug: candidate,
      ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {}),
    })
      .select("_id")
      .lean()
    if (!taken) return candidate
    candidate = `${base}-${n++}`
  }
}

// Purane approved/suspended sellers (jo is feature se pehle approve hue) ko
// unki join date ke order mein slug deta hai. Ek baar sab ko mil jaye to
// dobara DB check nahi hota.
let backfillDone = false
export async function backfillStoreSlugs() {
  if (backfillDone) return
  const sellers = await User.find({
    sellerStatus: { $in: ["approved", "suspended"] },
    storeName: { $exists: true, $ne: "" },
    storeSlug: { $exists: false },
  })
    .select("_id storeName")
    .sort({ createdAt: 1 })
    .lean()

  for (const s of sellers as unknown as { _id: mongoose.Types.ObjectId; storeName?: string }[]) {
    const slug = await generateUniqueStoreSlug(s.storeName || "", s._id)
    await User.updateOne({ _id: s._id, storeSlug: { $exists: false } }, { $set: { storeSlug: slug } })
  }
  backfillDone = true
}
