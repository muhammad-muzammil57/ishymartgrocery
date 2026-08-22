import mongoose from "mongoose"

export interface IOrderChatMessage {
  sender: "buyer" | "deliveryBoy"
  senderId: mongoose.Types.ObjectId
  text: string
  isAiSuggestion?: boolean
  createdAt: Date
}

export interface IOrderChat {
  _id?: mongoose.Types.ObjectId
  order: mongoose.Types.ObjectId
  messages: IOrderChatMessage[]
  createdAt?: Date
  updatedAt?: Date
}

const messageSchema = new mongoose.Schema<IOrderChatMessage>(
  {
    sender: { type: String, enum: ["buyer", "deliveryBoy"], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 1000, trim: true },
    isAiSuggestion: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const orderChatSchema = new mongoose.Schema<IOrderChat>(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    messages: [messageSchema],
  },
  { timestamps: true }
)

const OrderChat =
  mongoose.models.OrderChat || mongoose.model<IOrderChat>("OrderChat", orderChatSchema)

export default OrderChat
