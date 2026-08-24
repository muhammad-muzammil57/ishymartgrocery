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

  // ─── Security code (2nd factor) ────────────────────────────────
  // Admin ko email par jo 6-digit code jata hai, uska plain text kabhi
  // DB mein store nahi hota — sirf hash. Jab tak yeh verify na ho, koi
  // bhi (chahe admin login bhi kyun na ho) chat join nahi kar sakta.
  joinCodeHash?: string | null
  joinCodeExpiresAt?: Date | null
  joinCodeAttempts?: number
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

    joinCodeHash: { type: String, default: null },
    joinCodeExpiresAt: { type: Date, default: null },
    joinCodeAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
)

if (mongoose.models.Chat) {
  delete (mongoose.models as any).Chat
}

const Chat = mongoose.model<IChat>("Chat", chatSchema)
export default Chat
