// app/Models/order.model.ts
import mongoose from "mongoose"

export interface IOrder {
  isPaid: boolean
  _id?: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  items: {
    grocery: mongoose.Types.ObjectId
    name: string
    price: string
    unit: string
    image: string
    quantity: number
    seller?: mongoose.Types.ObjectId | null // null = IshyMart (admin) product
    feedbackGiven?: boolean
  }[]
  totalAmount: number
  paymentMethod: "cod" | "online"
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
  assignment?:mongoose.Types.ObjectId
  assignedDeliveryBoy:mongoose.Types.ObjectId
  status: "pending" | "out of delivery" | "delivered" | "cancelled"
  cancelReason?: string
  // ─── Jab order "delivered" mark hota hai, uska exact time yahan save hota
  // hai. Delivery boy ke daily/weekly/monthly stats aur 30-din auto-delete
  // dono isi field par depend karte hain (order.updatedAt status ke ilawa
  // aur wajuhaat se bhi change ho sakta hai, is liye alag field zaroori hai)
  deliveredAt?: Date
  // ─── Live delivery tracking ───────────────────────────────
  currentLocation?: {
    latitude: number
    longitude: number
    updatedAt: Date
  }
  // ─── OTP based delivery confirmation ──────────────────────
  deliveryOtp?: string
  deliveryOtpExpiresAt?: Date
  // ✅ Meta field - orderId aur trackerToken store karne ke liye
  meta?: {
    orderId?: string
    trackerToken?: string
  }
  createdAt?: Date
  updatedAt?: Date
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        grocery: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Grocery",
          required: true,
        },
        name: String,
        price: String,
        unit: String,
        image: String,
        quantity: Number,
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        feedbackGiven: {
          type: Boolean,
          default: false,
        },
      },
    ],
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },
    totalAmount: Number,
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

    assignment:{
       type:mongoose.Schema.Types.ObjectId,
      ref:"DeliveryAssignment",
      default:null
    },
    assignedDeliveryBoy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
    status: {
      type: String,
      enum: ["pending", "out of delivery", "delivered", "cancelled"],
      default: "pending",
    },
    cancelReason: {
      type: String,
      required: false,
    },
    deliveredAt: {
      type: Date,
      required: false,
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },
    deliveryOtp: {
      type: String,
      select: false, // API responses mein by default hide rahe, sirf explicit select par milega
    },
    deliveryOtpExpiresAt: {
      type: Date,
      select: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    // ✅ orderId store karo duplicate prevention ke liye
    meta: {
      orderId: { type: String, sparse: true },
      trackerToken: { type: String, sparse: true },
    },
  },
  { timestamps: true }
)

// ✅ Index - fast query ke liye
orderSchema.index({ "meta.orderId": 1 }, { sparse: true })
orderSchema.index({ user: 1, createdAt: -1 })
// Delivery boy stats (daily/weekly/monthly) aur 30-din auto-delete ke liye
orderSchema.index({ assignedDeliveryBoy: 1, status: 1, deliveredAt: -1 })
orderSchema.index({ status: 1, deliveredAt: 1 })

delete (mongoose.models as any).Order
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema)

export default Order
