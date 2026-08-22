// src/app/lib/emitSocketEvent.ts
// Next.js API routes ek alag process hain (socket server se), is liye yahan
// se seedha io.emit nahi kiya ja sakta. Yeh helper socket server ke internal
// "/emit" endpoint ko server-to-server call karta hai (shared secret ke
// sath), jo aage connected clients ko room ke hisaab se real-time broadcast
// kar deta hai. Isi tareeqe se hum poora 3/4/5-second polling khatam kar k
// har cheez ko Socket.IO par shift kar rahe hain.
//
// Yeh function kabhi bhi throw nahi karta — agar socket server down ho ya
// unreachable ho, to bhi original DB operation (jis ke baad yeh call hoti
// hai) fail nahi honi chahiye. Real-time sirf ek "enhancement" hai, source
// of truth hamesha database hi hai.
export async function emitSocketEvent(
  room: string,
  event: string,
  payload?: unknown
) {
  try {
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER
    const secret = process.env.SOCKET_INTERNAL_SECRET
    if (!socketServerUrl || !secret) {
      console.warn("emitSocketEvent: socket server URL/secret not configured, skipping")
      return
    }

    await fetch(`${socketServerUrl}/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": secret,
      },
      body: JSON.stringify({ room, event, payload }),
      // Next.js route handlers ke liye — is call ko cache na kare
      cache: "no-store",
    })
  } catch (error) {
    console.error(`emitSocketEvent failed (room=${room}, event=${event}):`, error)
  }
}
