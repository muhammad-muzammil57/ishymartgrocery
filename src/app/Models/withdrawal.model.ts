import mongoose from "mongoose"

export interface IWithdrawal {
  _id?: mongoose.Types.ObjectId
  seller: mongoose.Types.ObjectId
  amount: number
  status: "pending" | "approved" | "rejected"
  rejectionReason?: string
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  // seller ke liye: approved requests unke "withdrawal page" se hide ho jati hain
  // lekin admin ki copy hamesha rehti hai (hiddenForSeller flag se)
  hiddenForSeller?: boolean
  createdAt?: Date
  updatedAt?: Date
}

const withdrawalSchema = new mongoose.Schema<IWithdrawal>(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, required: false, maxlength: 500 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    hiddenForSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
)

withdrawalSchema.index({ seller: 1, createdAt: -1 })
withdrawalSchema.index({ status: 1 })

const Withdrawal =
  mongoose.models.Withdrawal || mongoose.model<IWithdrawal>("Withdrawal", withdrawalSchema)

export default Withdrawal
