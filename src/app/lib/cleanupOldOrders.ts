import Order from "@/app/Models/order.model"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// Jo order "delivered" ho chuka hai aur usay delivered huay 30 din se zyada ho
// gaye hain, woh khud hi database se hat jata hai. Iska koi alag cron server
// nahi laga rahe (extra infra ki zaroorat nahi) — is ki jagah yeh helper admin
// ke orders/dashboard API jab bhi hit hoti hai tab lazily purane delivered
// orders check kar k delete kar deta hai. Chunk-based safe delete hai, is
// liye baqi request par asar nahi padta.
export async function cleanupOldDeliveredOrders() {
  try {
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS)
    const result = await Order.deleteMany({
      status: "delivered",
      deliveredAt: { $lt: cutoff },
    })
    if (result.deletedCount > 0) {
      console.log(`cleanupOldDeliveredOrders: removed ${result.deletedCount} order(s) older than 30 days`)
    }
    return result.deletedCount || 0
  } catch (error) {
    console.error("cleanupOldDeliveredOrders error:", error)
    return 0
  }
}
