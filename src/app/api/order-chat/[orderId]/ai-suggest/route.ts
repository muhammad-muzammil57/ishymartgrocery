import connectDb from "@/app/lib/db"
import Order from "@/app/Models/order.model"
import OrderChat from "@/app/Models/orderChat.model"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

// Agar ANTHROPIC_API_KEY set nahi hai to yeh simple rule-based suggestions
// return karta hai taake feature deployment ke bina bhi crash na ho.
function fallbackSuggestions(role: "buyer" | "deliveryBoy"): string[] {
  if (role === "buyer") {
    return [
      "Aap order lekar kitni der mein pohanch jayenge?",
      "Please gate/reception par call kar dein jab pohanch jayen.",
      "Kya aap thodi der wait kar sakte hain, main 5 minute mein pohanchta hoon.",
    ]
  }
  return [
    "Main 10 minute mein pohanch raha hoon.",
    "Kya aap apni exact location share kar sakte hain?",
    "Main aapki building ke bahar khara hoon.",
  ]
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb()
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await params
    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    const isBuyer = order.user.toString() === session.user.id
    const isDeliveryBoy = order.assignedDeliveryBoy?.toString() === session.user.id
    if (!isBuyer && !isDeliveryBoy) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    const role: "buyer" | "deliveryBoy" = isBuyer ? "buyer" : "deliveryBoy"

    const chat = await OrderChat.findOne({ order: orderId })
    const recentMessages = (chat?.messages || []).slice(-8)

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ suggestions: fallbackSuggestions(role) }, { status: 200 })
    }

    const conversationText = recentMessages
      .map((m: any) => `${m.sender === "buyer" ? "Buyer" : "Delivery Partner"}: ${m.text}`)
      .join("\n")

    const systemPrompt =
      role === "buyer"
        ? "You help a grocery delivery buyer quickly reply to their delivery partner during an active delivery. Reply ONLY with 3 short, casual message suggestions (Roman Urdu/English mix is fine), one per line, no numbering, no extra text."
        : "You help a delivery partner quickly reply to a buyer during an active grocery delivery. Reply ONLY with 3 short, professional-but-friendly message suggestions (Roman Urdu/English mix is fine), one per line, no numbering, no extra text."

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: conversationText
              ? `Recent conversation:\n${conversationText}\n\nSuggest 3 short replies for the ${role}.`
              : `No messages yet. Suggest 3 short opening messages for the ${role} to send.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error("Anthropic API error:", await response.text())
      return NextResponse.json({ suggestions: fallbackSuggestions(role) }, { status: 200 })
    }

    const data = await response.json()
    const text = data.content?.map((b: any) => b.text || "").join("\n") || ""
    const suggestions = text
      .split("\n")
      .map((line: string) => line.replace(/^[-•\d.)\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3)

    return NextResponse.json(
      { suggestions: suggestions.length ? suggestions : fallbackSuggestions(role) },
      { status: 200 }
    )
  } catch (error) {
    console.error("order chat ai-suggest error:", error)
    return NextResponse.json({ suggestions: fallbackSuggestions("buyer") }, { status: 200 })
  }
}
