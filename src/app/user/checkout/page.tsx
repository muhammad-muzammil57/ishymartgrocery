"use client"

import React, { useEffect, useState, useCallback } from "react"
import { motion } from "motion/react"
import {
  ArrowLeft,
  Banknote,
  Building,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Podcast,
  Truck,
  User,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import useGetMe from "@/hooks/useGetMe"
import MapViewWrapper from "@/components/MapViewWrapper"
import axios from "axios"
import { OpenStreetMapProvider } from "leaflet-geosearch"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"

interface UserData {
  _id?: string
  name?: string
  mobile?: string
}

type PaymentMethod = "cod" | "online"

export default function CheckoutPage() {
  const router = useRouter()
  const { subTotal, deliveryFee, finalTotal, cartData } = useSelector(
    (state: RootState) => state.cart
  )
  const userData = useGetMe() as UserData | null

  // ===== ADDRESS STATE =====
  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    postalCode: "",
    fullAddress: "",
  })

  // ===== OTHER STATE =====
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ===== AUTOFILL USER DATA =====
  useEffect(() => {
    if (userData?.name || userData?.mobile) {
      setAddress((prev) => ({
        ...prev,
        fullName: userData.name || prev.fullName,
        mobile: userData.mobile || prev.mobile,
      }))
    }
  }, [userData])

  // ===== GET CURRENT LOCATION =====
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPosition([coords.latitude, coords.longitude]),
      (err) => console.warn("Location error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [])

  // ===== REVERSE GEOCODE: position se address fill karo =====
  useEffect(() => {
    if (!position) return

    const fetchAddress = async () => {
      try {
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`
        )
        const a = data.address
        setAddress((prev) => ({
          ...prev,
          city:
            a.city || a.town || a.village || a.district || a.subdistrict || a.state_district || "",
          state: a.state || "",
          postalCode: a.postcode || "",
          fullAddress: data.display_name || "",
        }))
      } catch {
        console.warn("Reverse geocode failed")
      }
    }

    fetchAddress()
  }, [position])

  // ===== INPUT CHANGE =====
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ===== LOCATION SEARCH =====
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    try {
      const provider = new OpenStreetMapProvider()
      const results = await provider.search({ query: searchQuery })
      if (results.length > 0) {
        setPosition([results[0].y, results[0].x])
      }
    } catch {
      setError("Location search fail ho gayi")
    } finally {
      setSearchLoading(false)
    }
  }

  // ===== VALIDATE BEFORE CHECKOUT =====
  const validate = useCallback((): string | null => {
    if (!position) return "First On and Select Your Location to Continue...!"
    if (!address.fullName.trim()) return "Full name is required"
    if (!address.mobile.trim()) return "Mobile number is required"
    if (!address.fullAddress.trim()) return "Address is required"
    if (cartData.length === 0) return "Cart is Empty....! Shop Now To Continue"
    return null
  }, [position, address, cartData])

  // ===== COD ORDER =====
  const handleCod = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await axios.post("/api/user/order", {
        userId: userData?._id,
        items: cartData.map((item) => ({
          grocery: item._id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: finalTotal,
        paymentMethod: "cod",
        address: {
          fullName: address.fullName,
          mobile: address.mobile,
          city: address.city,
          state: address.state,
          fullAddress: address.fullAddress,
          pincode: address.postalCode,
          latitude: position![0],
          longitude: position![1],
        },
      })

      router.push("/user/order-success")
    } catch (err: any) {
      setError("Order place karne mein masla aa gaya. Dobara koshish karein.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ===== ONLINE PAYMENT =====
  const handleOnlinePayment = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartData,
          userData,
          address,
          position,
        }),
      })

      const data = await res.json()

      if (!data.success || !data.checkoutUrl) {
        throw new Error(data.error || "Checkout URL nahi mili")
      }

      // ✅ SafePay checkout page pe redirect karo - SAME tab mein
      // (success page pe wapis aane ke baad polling shuru hogi)
      window.location.href = data.checkoutUrl
    } catch (err: any) {
      setError("Payment shuru karne mein masla aa gaya. Dobara koshish karein.")
      console.error(err)
      setLoading(false)
    }
    // NOTE: setLoading(false) yahan nahi - page redirect ho raha hai
  }

  // ===== PLACE ORDER HANDLER =====
  const handlePlaceOrder = () => {
    setError(null)
    if (paymentMethod === "cod") {
      handleCod()
    } else {
      handleOnlinePayment()
    }
  }

  return (
    <div className="w-[92%] md:w-[80%] mx-auto py-10 relative">
      {/* Back Button */}
      <motion.button
        onClick={() => router.push("/user/cart")}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileTap={{ scale: 0.95 }}
        className="absolute left-0 flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:inline">Back To Cart</span>
      </motion.button>

      {/* Heading */}
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-green-700 mb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Checkout
      </motion.h1>

      {/* Error Banner */}
      {error && (
        <motion.div
          className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 font-bold text-lg leading-none">
            ×
          </button>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-10">
        {/* ====== LEFT: SHIPPING ADDRESS ====== */}
        <motion.div
          className="bg-white p-6 shadow-lg rounded-2xl border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2 justify-center">
            <MapPin className="text-green-700" />
            Delivery Address
          </h2>
          <p className="text-xs text-gray-400 text-center mb-6">
            Choose Your Location From Map Or Select/Edit Manually Address.
          </p>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm text-gray-600 font-medium mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-green-600" size={17} />
                <input
                  type="text"
                  name="fullName"
                  value={address.fullName}
                  onChange={handleChange}
                  placeholder="You Full Name...."
                  className="pl-9 w-full border border-green-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm text-gray-600 font-medium mb-1">Mobile *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-green-600" size={17} />
                <input
                  type="tel"
                  name="mobile"
                  value={address.mobile}
                  onChange={handleChange}
                  placeholder="03XX-XXXXXXX"
                  className="pl-9 w-full border border-green-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-sm text-gray-600 font-medium mb-1">Home Address *</label>
              <div className="relative">
                <Home className="absolute left-3 top-3.5 text-green-600" size={17} />
                <input
                  type="text"
                  name="fullAddress"
                  value={address.fullAddress}
                  onChange={handleChange}
                  placeholder="Street, Village, House Number..."
                  className="pl-9 w-full border border-green-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            {/* City / State / Postal */}
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <Building className="absolute left-2 top-3.5 text-green-600" size={15} />
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  placeholder="City...."
                  className="pl-8 w-full border border-green-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="relative">
                <Navigation className="absolute left-2 top-3.5 text-green-600" size={15} />
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  placeholder="State...."
                  className="pl-8 w-full border border-green-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="relative">
                <Podcast className="absolute left-2 top-3.5 text-green-600" size={15} />
                <input
                  type="text"
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleChange}
                  placeholder="Postal"
                  className="pl-8 w-full border border-green-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            {/* Location Search */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
                placeholder="Search your city or Area..."
                className="flex-1 border border-green-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <button
                onClick={handleSearchLocation}
                className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700 transition font-medium text-sm min-w-[80px] flex items-center justify-center"
              >
                {searchLoading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
              </button>
            </div>

            {/* Map */}
            <div className="relative h-[320px] rounded-xl overflow-hidden border border-green-200 shadow-inner">
              <MapViewWrapper position={position} setPosition={setPosition} />
              {!position && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-50/80 pointer-events-none">
                  <p className="text-green-700 font-medium text-sm">📍 Turn Your Location ON</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ====== RIGHT: PAYMENT ====== */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2 justify-center">
            <CreditCard className="text-green-700" />
            Payment Method
          </h2>
          <p className="text-xs text-gray-400 text-center mb-6">
            Choose Your Payment Method
          </p>

          {/* Payment Options */}
          <div className="space-y-3 mb-6">
            {/* Online */}
            <button
              onClick={() => setPaymentMethod("online")}
              className={`w-full flex items-center gap-4 border-2 rounded-xl p-4 transition-all text-left ${
                paymentMethod === "online"
                  ? "border-green-600 bg-green-50 shadow-md"
                  : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "online" ? "bg-green-600" : "bg-gray-100"}`}>
                <Banknote size={20} className={paymentMethod === "online" ? "text-white" : "text-gray-500"} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Online Payment</p>
                <p className="text-xs text-gray-400">SafePay - Credit/Debit Card</p>
              </div>
              {paymentMethod === "online" && (
                <div className="ml-auto w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>

            {/* COD */}
            <button
              onClick={() => setPaymentMethod("cod")}
              className={`w-full flex items-center gap-4 border-2 rounded-xl p-4 transition-all text-left ${
                paymentMethod === "cod"
                  ? "border-green-600 bg-green-50 shadow-md"
                  : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "cod" ? "bg-green-600" : "bg-gray-100"}`}>
                <Truck size={20} className={paymentMethod === "cod" ? "text-white" : "text-gray-500"} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Cash On Delivery</p>
                <p className="text-xs text-gray-400">Pay Cash Upon Delivery</p>
              </div>
              {paymentMethod === "cod" && (
                <div className="ml-auto w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">SubTotal</span>
              <span className="font-semibold text-gray-700">Rs. {subTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : "text-gray-700"}`}>
                {deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}
              </span>
            </div>
            {deliveryFee === 0 && (
              <p className="text-xs text-green-600 text-right">🎉 Free Delivery On Rs. 1000+ order!</p>
            )}
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3">
              <span className="text-gray-800">Total</span>
              <span className="text-green-700">Rs. {finalTotal}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <motion.button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-6 bg-green-600 text-white py-3.5 rounded-full font-bold text-base hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Please Wait...</span>
              </>
            ) : paymentMethod === "cod" ? (
              "Place Your Order"
            ) : (
              <>
                <Banknote size={18} />
               Online Payment | Payment Through SafePay
              </>
            )}
          </motion.button>

          <p className="text-xs text-gray-400 text-center mt-3">
            {paymentMethod === "online"
              ? "🔒 You Will Be Redirected To SafePay Secure Checkout."
              : "📦 After Order Placed, a delivery agent will arrive at your address."}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
