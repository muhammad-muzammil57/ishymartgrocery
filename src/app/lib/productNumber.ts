// src/app/lib/productNumber.ts
//
// Har product ko ek unique public number milta hai (ebay ke /itm/123 ki
// tarah). Numbers 1000 se shuru hote hain aur har naye product par 1 barhte
// hain: 1000, 1001, 1002 ...  Product ka URL banta hai:  /mat/<number>
import Counter from "@/app/Models/counter.model"
import Grocery from "@/app/Models/grocery.model"

export const PRODUCT_NUMBER_START = 1000

// Atomic increment — 2 products ek sath add hon tab bhi number duplicate nahi hoga
export async function getNextProductNumber(): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: "productNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
  return PRODUCT_NUMBER_START - 1 + counter.seq
}

// Purane products (jo is feature se pehle bane) ko number de deta hai, unki
// creation date ke order mein. Ek baar sab ko number mil jaye to dobara
// DB check nahi hota (naye products create hote hi number le lete hain).
let backfillDone = false
export async function backfillProductNumbers() {
  if (backfillDone) return
  const missing = await Grocery.find({ productNumber: { $exists: false } })
    .select("_id")
    .sort({ createdAt: 1 })
    .lean()

  for (const g of missing as { _id: unknown }[]) {
    const number = await getNextProductNumber()
    await Grocery.updateOne(
      { _id: g._id, productNumber: { $exists: false } },
      { $set: { productNumber: number } }
    )
  }
  backfillDone = true
}
