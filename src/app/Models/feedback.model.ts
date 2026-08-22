import mongoose from "mongoose"

export interface IFeedback {
  _id?: mongoose.Types.ObjectId
  order: mongoose.Types.ObjectId
  grocery: mongoose.Types.ObjectId
  seller: mongoose.Types.ObjectId
  buyer: mongoose.Types.ObjectId
  rating: number // 1-5
  comment?: string
  createdAt?: Date
  updatedAt?: Date
}

const feedbackSchema = new mongoose.Schema<IFeedback>(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    grocery: { type: mongoose.Schema.Types.ObjectId, ref: "Grocery", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 800, trim: true },
  },
  { timestamps: true }
)

// Ek buyer sirf aik dafa hi kisi order ke item par feedback de sakta hai
feedbackSchema.index({ order: 1, grocery: 1, buyer: 1 }, { unique: true })
feedbackSchema.index({ seller: 1, createdAt: -1 })

const Feedback =
  mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", feedbackSchema)

export default Feedback
