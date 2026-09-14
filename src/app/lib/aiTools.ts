// ─── AI Chat: Tools (function-calling) ─────────────────────────────────────
// SECURITY RULE (bohat zaroori): AI ko kabhi bhi seedhi database query karne
// ki ijazat nahi di jati. AI sirf neeche diye gaye "tools" (functions) call
// kar sakta hai, aur har tool andar hi andar apne aap logged-in user ki
// "session.user.id" / "session.user.role" use karta hai — AI ya user khud
// koi userId, email ya dusre ka data mangwa hi nahi sakta, kyunke tool
// functions aisa parameter accept hi nahi karte.
//
// Har tool ke andar role-check hai. Agar galat role se koi tool call ho, to
// seedha "Unauthorized" error return hota hai — koi data nahi jata.

import connectDb from "./db"
import Grocery from "../Models/grocery.model"
import Order from "../Models/order.model"

type Session = {
  user?: {
    id?: string
    role?: string
    name?: string
  }
} | null

const GROCERY_CATEGORIES = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Rice, Atta & Pulses",
  "Snacks & Biscuits",
  "Beverages & Drinks",
  "Personal Care & Hygiene",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet Care",
  "Spices & Masalas",
]

// ─── Tool schemas (OpenAI / Groq function-calling format) ──────────────────
// "roles" field batata hai yeh tool kis role ke liye allowed hai — API route
// isi list se filter karke sirf permitted tools AI ko bhejta hai.
export const AI_TOOL_DEFINITIONS = [
  {
    roles: ["user", "deliveryBoy"],
    schema: {
      type: "function",
      function: {
        name: "search_grocery_items",
        description:
          "IshyMart ke grocery store se items aur unki price, unit, category dhoondhta hai. Sirf public product info deta hai (koi personal ya admin data nahi).",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Item ka naam ya keyword, jaise 'rice' ya 'milk'. Optional.",
            },
            category: {
              type: "string",
              enum: GROCERY_CATEGORIES,
              description: "Category se filter karne ke liye. Optional.",
            },
          },
          required: [],
        },
      },
    },
  },
  {
    roles: ["user"],
    schema: {
      type: "function",
      function: {
        name: "get_my_orders",
        description:
          "SIRF logged-in user ke apne orders wapis karta hai (koi dusre user ka data nahi). Order ki list, status aur total amount deta hai.",
        parameters: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["pending", "out of delivery", "delivered", "cancelled"],
              description: "Kisi khaas status ke orders dekhne ke liye. Optional — na diya jaye to sab recent orders aa jayenge.",
            },
            limit: {
              type: "number",
              description: "Kitne recent orders chahiye (max 20). Optional, default 10.",
            },
          },
          required: [],
        },
      },
    },
  },
  {
    roles: ["deliveryBoy"],
    schema: {
      type: "function",
      function: {
        name: "get_delivery_stats",
        description:
          "SIRF logged-in delivery boy ke apne stats deta hai: aaj/hafte/mahine mein kitne orders deliver kiye, aur abhi kitne orders 'out for delivery' pending hain.",
        parameters: { type: "object", properties: {}, required: [] },
      },
    },
  },
  {
    roles: ["user", "deliveryBoy"],
    schema: {
      type: "function",
      function: {
        name: "open_live_chat",
        description:
          "Jab user support se baat karna chahe, complaint karni ho, ya kisi insaan (human agent) se baat karni ho, yeh tool call karke live chat support widget open karo.",
        parameters: { type: "object", properties: {}, required: [] },
      },
    },
  },
] as const

export function getToolsForRole(role?: string) {
  return AI_TOOL_DEFINITIONS.filter(
    (t) => !!role && (t.roles as readonly string[]).includes(role)
  ).map((t) => t.schema)
}

// ─── Tool execution (yahan asli security check hota hai) ───────────────────
export async function runAiTool(name: string, args: any, session: Session) {
  const role = session?.user?.role
  const userId = session?.user?.id

  if (!userId || !role) {
    return { error: "Unauthorized: aap login nahi hain." }
  }

  try {
    switch (name) {
      case "search_grocery_items": {
        await connectDb()
        const filter: any = {}
        if (args?.category && GROCERY_CATEGORIES.includes(args.category)) {
          filter.category = args.category
        }
        if (args?.query && typeof args.query === "string") {
          filter.name = { $regex: args.query.trim(), $options: "i" }
        }
        const items = await Grocery.find(filter)
          .select("name price unit category -_id")
          .limit(15)
          .lean()
        return { items }
      }

      case "get_my_orders": {
        if (role !== "user") {
          return { error: "Unauthorized: yeh sirf customer account ke liye hai." }
        }
        await connectDb()
        const filter: any = { user: userId }
        if (
          args?.status &&
          ["pending", "out of delivery", "delivered", "cancelled"].includes(args.status)
        ) {
          filter.status = args.status
        }
        const limit = Math.min(Math.max(Number(args?.limit) || 10, 1), 20)
        const orders = await Order.find(filter)
          .select("items totalAmount paymentMethod status createdAt deliveredAt -_id")
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
        return {
          orders: orders.map((o: any) => ({
            items: o.items?.map((it: any) => ({ name: it.name, quantity: it.quantity, price: it.price })),
            totalAmount: o.totalAmount,
            paymentMethod: o.paymentMethod,
            status: o.status,
            createdAt: o.createdAt,
            deliveredAt: o.deliveredAt || null,
          })),
        }
      }

      case "get_delivery_stats": {
        if (role !== "deliveryBoy") {
          return { error: "Unauthorized: yeh sirf delivery boy account ke liye hai." }
        }
        await connectDb()
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const sevenDaysAgo = new Date(startOfToday)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const baseFilter = { assignedDeliveryBoy: userId, status: "delivered" }

        const [deliveredToday, deliveredLastWeek, deliveredThisMonth, outForDelivery] =
          await Promise.all([
            Order.countDocuments({ ...baseFilter, deliveredAt: { $gte: startOfToday } }),
            Order.countDocuments({ ...baseFilter, deliveredAt: { $gte: sevenDaysAgo } }),
            Order.countDocuments({ ...baseFilter, deliveredAt: { $gte: startOfMonth } }),
            Order.countDocuments({ assignedDeliveryBoy: userId, status: "out of delivery" }),
          ])

        return { deliveredToday, deliveredLastWeek, deliveredThisMonth, outForDelivery }
      }

      case "open_live_chat": {
        return { opened: true, __action: "open_support" }
      }

      default:
        return { error: "Unknown tool" }
    }
  } catch (err) {
    console.error("AI tool error:", name, err)
    return { error: "Internal error while fetching this data." }
  }
}
