import mongoose from "mongoose"

export interface IPendingOrder {
  orderId: string
  trackerToken: string
  userId?: mongoose.Types.ObjectId
  items: {
    grocery: mongoose.Types.ObjectId
    name: string
    price: string
    unit: string
    quantity: number
    image: string
  }[]
  totalAmount: number
  address: {
    fullName: string
    mobile: string
    city: string
    state: string
    pincode: string
    fullAddress: string
    latitude: number
    longitude: number
  }
  createdAt?: Date
}

const pendingOrderSchema = new mongoose.Schema<IPendingOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    trackerToken: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        grocery: { type: mongoose.Schema.Types.ObjectId, ref: "Grocery", required: true },
        name: String,
        price: String,
        unit: String,
        quantity: Number,
        image: String,
      },
    ],
    totalAmount: { type: Number, required: true },
    address: {
      fullName: String,
      mobile: String,
      city: String,
      state: String,
      pincode: String,
      fullAddress: String,
      latitude: Number,
      longitude: Number,
    },
  },
  {
    timestamps: true,
    // 30 minute baad automatically delete ho jaye agar payment nahi hui
    expireAfterSeconds: 1800,
  }
)

// TTL index - 30 min baad expire
pendingOrderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 })

delete (mongoose.models as any).PendingOrder
const PendingOrder = mongoose.models.PendingOrder || mongoose.model("PendingOrder", pendingOrderSchema)

export default PendingOrder
