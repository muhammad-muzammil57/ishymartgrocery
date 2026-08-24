// src/app/lib/joinToken.ts
//
// Livechat "Join" ko secure karne ke liye chhota helper.
//
// Flow:
//   1) User chat start karta hai → admin ko email par ek 6-digit
//      security code jata hai (plain code DB mein kabhi save nahi hota,
//      sirf uska hash — hashJoinCode()).
//   2) Admin apna login (session, role=admin) + wahi code enter karta hai.
//   3) Code sahi ho to yeh signJoinToken() se ek HMAC-signed token banta
//      hai (SOCKET_INTERNAL_SECRET se sign hota hai — yeh secret sirf
//      server par hota hai, browser bundle mein kabhi nahi jata).
//   4) Yehi token browser socket server ko chat:join ke sath bhejta hai.
//   5) Socket server (index.js) EXACTLY yehi algorithm se token verify
//      karta hai — agar koi seedha socket server se connect kar ke
//      chat:join try kare bina valid token ke, reject ho jayega. Roomid
//      jaan lena bhi kaafi nahi — token ke bina koi join nahi kar sakta.
import crypto from "crypto"

const TOKEN_TTL_MS = 6 * 60 * 60 * 1000 // 6 ghante

export interface JoinTokenPayload {
  roomId: string
  adminId: string
  adminName: string
}

export function signJoinToken(payload: JoinTokenPayload): string {
  const secret = process.env.SOCKET_INTERNAL_SECRET
  if (!secret) {
    throw new Error("SOCKET_INTERNAL_SECRET not configured — cannot issue join token")
  }
  const body = { ...payload, exp: Date.now() + TOKEN_TTL_MS }
  const json = Buffer.from(JSON.stringify(body)).toString("base64url")
  const sig = crypto.createHmac("sha256", secret).update(json).digest("hex")
  return `${json}.${sig}`
}

// 6-digit security code generate karo
export function generateJoinCode(): string {
  return crypto.randomInt(100000, 1000000).toString()
}

// Code ko hash karke store karne ke liye (SOCKET_INTERNAL_SECRET se pepper
// kiya hua hai taa k DB leak hone par bhi offline guess na ho sake)
export function hashJoinCode(roomId: string, code: string): string {
  const secret = process.env.SOCKET_INTERNAL_SECRET || ""
  return crypto.createHash("sha256").update(`${roomId}:${code}:${secret}`).digest("hex")
}
