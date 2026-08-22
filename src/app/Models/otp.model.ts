import mongoose from "mongoose";

interface IOtp {
  email: string;
  otp: string;
  type: "register" | "login" | "admin-access";
  expiresAt: Date;
  // For register OTP we also store pending user data
  pendingName?: string;
  pendingPassword?: string;
}

const otpSchema = new mongoose.Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ["register", "login", "admin-access"], required: true },
  expiresAt: { type: Date, required: true },
  pendingName: { type: String },
  pendingPassword: { type: String },
});

// Auto-delete expired OTPs (MongoDB TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

if (mongoose.models.Otp) {
  delete (mongoose.models as any).Otp
}
const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
