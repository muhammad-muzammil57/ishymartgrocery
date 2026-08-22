// app/payment/success/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2, ShoppingBag, ArrowRight } from "lucide-react"
import { motion } from "motion/react"

type PaymentStatus = "loading" | "success" | "failed" | "timeout"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const orderId = searchParams.get("orderId")
  const token = searchParams.get("token")

  const [status, setStatus] = useState<PaymentStatus>("loading")
  const [attempts, setAttempts] = useState(0)
  const MAX_ATTEMPTS = 20 // 20 × 3s = 60 seconds timeout

  useEffect(() => {
    if (!orderId) {
      setStatus("failed")
      return
    }

    // ✅ Polling - har 3 second mein check karo
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/verify?orderId=${orderId}`)
        const data = await res.json()

        setAttempts((prev) => {
          const newAttempts = prev + 1

          if (data.paid) {
            clearInterval(interval)
            setStatus("success")
          } else if (newAttempts >= MAX_ATTEMPTS) {
            clearInterval(interval)
            setStatus("timeout")
          }

          return newAttempts
        })
      } catch (err) {
        console.error("Verify check error:", err)
      }
    }, 3000)

    // Pehla check turant karo
    const firstCheck = async () => {
      try {
        const res = await fetch(`/api/payment/verify?orderId=${orderId}`)
        const data = await res.json()
        if (data.paid) {
          clearInterval(interval)
          setStatus("success")
        }
      } catch {}
    }
    firstCheck()

    return () => clearInterval(interval)
  }, [orderId])

  // ============ LOADING ============
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 max-w-md w-[90%]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Loader2 className="text-green-600 animate-spin" size={40} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">We are verifying your payment...</h1>
          <p className="text-gray-500 text-center text-sm">
            Your payment is being confirmed. Kindly wait for a short while, please Thankyou!.
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              animate={{ width: `${(attempts / MAX_ATTEMPTS) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-400">
            Check {attempts}/{MAX_ATTEMPTS}
          </p>
        </motion.div>
      </div>
    )
  }

  // ============ SUCCESS ============
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 max-w-md w-[90%]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
          >
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={56} strokeWidth={1.5} />
            </div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Done! 🎉</h1>
            <p className="text-gray-500">Your order is successfully placed!.</p>
          </motion.div>

          {/* Order ID */}
          {orderId && (
            <motion.div
              className="w-full bg-green-50 border border-green-200 rounded-xl p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-gray-500 text-center mb-1">Order ID</p>
              <p className="text-green-700 font-mono font-bold text-center text-sm break-all">{orderId}</p>
            </motion.div>
          )}

          <motion.p
            className="text-sm text-gray-400 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            YOU WILL RECEIVE DELIVERY INFORMATION SHORTLY.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => router.push("/user/my-order")}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition-all"
            >
              <ShoppingBag size={18} />
              My Orders
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 flex items-center justify-center gap-2 border border-green-600 text-green-700 py-3 rounded-full font-semibold hover:bg-green-50 transition-all"
            >
              Continue Shopping
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // ============ TIMEOUT ============
  if (status === "timeout") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 max-w-md w-[90%]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center">
            <Loader2 className="text-yellow-500" size={48} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Pending...</h1>
            <p className="text-gray-500 text-sm">
              Payment confirmation is taking a little longer.Please check your order.
            </p>
          </div>
          {orderId && (
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 text-center mb-1">Order ID</p>
              <p className="text-yellow-700 font-mono font-bold text-center text-sm break-all">{orderId}</p>
            </div>
          )}
          <button
            onClick={() => router.push("/user/my-order")}
            className="w-full bg-yellow-500 text-white py-3 rounded-full font-semibold hover:bg-yellow-600 transition-all"
          >
            Go To My Orders
          </button>
        </motion.div>
      </div>
    )
  }

  // ============ FAILED ============
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 max-w-md w-[90%]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="text-red-500" size={52} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Has Not Been Received Yet!</h1>
          <p className="text-gray-500 text-sm">
            There seems to be an issue.Please try again or use Cash On Deliver (COD)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => router.push("/user/cart")}
            className="flex-1 bg-red-500 text-white py-3 rounded-full font-semibold hover:bg-red-600 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all"
          >
            Go To Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}
