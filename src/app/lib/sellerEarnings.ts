import User from "@/app/Models/user.model"

/**
 * Order "delivered" hone par har seller item ka (price * quantity) uske
 * sellerBalance mein credit kar deta hai. Sirf ek dafa call hona chahiye
 * (caller pehle guard laga le ke order pehle se "delivered" nahi tha).
 */
export async function creditSellerEarningsForOrder(order: any) {
  const creditsBySeller = new Map<string, number>()
  for (const item of order.items as any[]) {
    if (!item.seller) continue // admin/IshyMart ka apna product, skip
    const price = parseFloat(item.price) || 0
    const amount = price * (item.quantity || 0)
    const key = item.seller.toString()
    creditsBySeller.set(key, (creditsBySeller.get(key) || 0) + amount)
  }
  for (const [sellerId, amount] of creditsBySeller.entries()) {
    if (amount > 0) {
      await User.findByIdAndUpdate(sellerId, { $inc: { sellerBalance: amount } })
    }
  }
}
