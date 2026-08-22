import mongoose from "mongoose";

interface IAdminCredentials {
  username: string;
  password: string;
}

interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
  adminCredentials?: IAdminCredentials;
  location?: {
    type: {
        type: StringConstructor;
        enum: string[];
        default: string;
    };
    coordinates: {
        type: NumberConstructor[];
        default: number[];
    };
};
socketId:string | null
isOnline:boolean
isSeller:boolean
sellerStatus:"none" | "pending" | "approved" | "rejected" | "suspended"
storeName?:string
sellerBalance?:number
sellerSuspendReason?:string
}

const adminCredentialsSchema = new mongoose.Schema<IAdminCredentials>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { _id: false }
);


const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    mobile: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "deliveryBoy", "admin"],
      default: "user",
    },
    image: {
      type: String,
    },
    location:{
      type:{
        type:String,
        enum:["Point"],
        default:"Point"
      },
      coordinates:{
        type:[Number],
        default:[0,0]
      }
    },
    socketId: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    // ─── Seller (marketplace) fields ─────────────────────────
    isSeller: {
      type: Boolean,
      default: false,
    },
    sellerStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected", "suspended"],
      default: "none",
    },
    storeName: {
      type: String,
      required: false,
    },
    // Available balance the seller can withdraw (rupees)
    sellerBalance: {
      type: Number,
      default: 0,
    },
    sellerSuspendReason: {
      type: String,
      required: false,
    },
    // Sirf admin users ke liye — username aur password
    adminCredentials: {
      type: adminCredentialsSchema,
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.index({location:"2dsphere"})

if (mongoose.models.User) {
  delete (mongoose.models as any).User
}
const User = mongoose.model("User", userSchema)
export default User