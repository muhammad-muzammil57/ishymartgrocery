import mongoose from "mongoose"

export interface ISellerApplication {
  _id?: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  fullName: string
  storeName: string
  address: string
  phone: string
  bankDocument: string // uploaded doc/image url (bank statement / IBAN slip)
  utilityBill: string // electricity bill url
  idDocument: string // any one verification doc (CNIC / passport / license) url
  status: "pending" | "approved" | "rejected"
  rejectionReason?: string
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

const sellerApplicationSchema = new mongoose.Schema<ISellerApplication>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    storeName: { type: String, required: true, trim: true, maxlength: 120 },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    bankDocument: { type: String, required: true },
    utilityBill: { type: String, required: true },
    idDocument: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, required: false, maxlength: 500 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
)

sellerApplicationSchema.index({ user: 1, createdAt: -1 })
sellerApplicationSchema.index({ status: 1 })

const SellerApplication =
  mongoose.models.SellerApplication ||
  mongoose.model<ISellerApplication>("SellerApplication", sellerApplicationSchema)

export default SellerApplication
