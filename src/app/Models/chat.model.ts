// src/app/Models/chat.model.ts
import mongoose from "mongoose"

interface IMessage {
  sender: "user" | "admin"
  senderName: string
  text: string
  createdAt: Date
}

interface IChat {
  roomId: string
  userId: string
  userName: string
  userEmail: string
  adminId?: string
  adminName?: string
  status: "waiting" | "active" | "closed"
  messages: IMessage[]
  createdAt: Date
}

const messageSchema = new mongoose.Schema<IMessage>({
  sender: { type: String, enum: ["user", "admin"], required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const chatSchema = new mongoose.Schema<IChat>(
  {
    roomId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    adminId: { type: String },
    adminName: { type: String },
    status: {
      type: String,
      enum: ["waiting", "active", "closed"],
      default: "waiting",
    },
    messages: [messageSchema],
  },
  { timestamps: true }
)

if (mongoose.models.Chat) {
  delete (mongoose.models as any).Chat
}

const Chat = mongoose.model<IChat>("Chat", chatSchema)
export default Chat
