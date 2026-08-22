'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, Bike, User, UserCog, Lock, KeyRound, ShieldCheck } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// Step types
type Step = "role" | "adminCredentials" | "adminOtp"

function EditRoleMobile() {
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState<Step>("role")

  // Role selection
  const roles = [
    { id: "admin", label: "Admin", icon: UserCog },
    { id: "user", label: "User", icon: User },
    { id: "deliveryBoy", label: "Delivery Boy", icon: Bike },
  ]
  const [selectedRole, setSelectedRole] = useState("")
  const [mobile, setMobile] = useState("")

  // Admin credentials
  const [username, setUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [credLoading, setCredLoading] = useState(false)
  const [credError, setCredError] = useState("")

  // OTP
  const [otp, setOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState("")

  // ─── Step 1: Role + Mobile select ───────────────────────────────────
  const handleRoleNext = () => {
    if (selectedRole === "admin") {
      setStep("adminCredentials")
    } else {
      handleNonAdminSubmit()
    }
  }

  const handleNonAdminSubmit = async () => {
    try {
      await axios.post("/api/user/edit-role-mobile", {
        role: selectedRole,
        mobile,
      })
      await update({ role: selectedRole })
      router.push("/")
    } catch (error) {
      console.log(error)
    }
  }

  // ─── Step 2: Admin credentials verify ───────────────────────────────
  const handleCredentialsVerify = async () => {
    setCredLoading(true)
    setCredError("")
    try {
      await axios.post("/api/admin/verify-credentials", {
        username,
        password: adminPassword,
      })
      // Credentials sahi — OTP step pe jao
      setStep("adminOtp")
    } catch (error: any) {
      setCredError(
        error?.response?.data?.message || "Galat username ya password"
      )
    } finally {
      setCredLoading(false)
    }
  }

  // ─── Step 3: OTP verify karo ─────────────────────────────────────────
  const handleOtpVerify = async () => {
    setOtpLoading(true)
    setOtpError("")
    try {
      await axios.post("/api/admin/verify-otp", { otp, mobile })
      await update({ role: "admin" })
      router.push("/") // aapka admin panel route
    } catch (error: any) {
      setOtpError(error?.response?.data?.message || "Galat OTP")
    } finally {
      setOtpLoading(false)
    }
  }

  // ─── UI ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen p-6 w-full items-center">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-extrabold text-green-700 text-center mt-8"
      >
        {step === "role" && "Select Your Role"}
        {step === "adminCredentials" && "Admin Login"}
        {step === "adminOtp" && "Verify Your OTP"}
      </motion.h1>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Role + Mobile ── */}
        {step === "role" && (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="flex flex-col items-center w-full"
          >
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10">
              {roles.map((role) => {
                const Icon = role.icon
                const isSelected = selectedRole === role.id
                return (
                  <motion.div
                    key={role.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-center justify-center w-48 h-44 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-green-600 bg-green-100 shadow-lg"
                        : "border-gray-300 bg-white hover:border-green-400"
                    }`}
                  >
                    <Icon />
                    <span className="mt-2 font-medium">{role.label}</span>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center mt-10"
            >
              <label htmlFor="mobile" className="text-gray-700 font-medium mb-2">
                Enter Your Mobile No.
              </label>
              <input
                type="tel"
                id="mobile"
                className="w-64 md:w-80 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800"
                placeholder="eg. +923001234567"
                onChange={(e) => setMobile(e.target.value)}
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              disabled={mobile.length <= 9 || !selectedRole}
              onClick={handleRoleNext}
              className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-2xl shadow-md transition-all duration-200 mt-10 ${
                selectedRole && mobile.length > 9
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {selectedRole === "admin" ? "Admin Login" : "Go to Home"}
              <ArrowRight />
            </motion.button>
          </motion.div>
        )}

        {/* ── STEP 2: Admin Credentials ── */}
        {step === "adminCredentials" && (
          <motion.div
            key="creds"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col items-center w-full mt-10 gap-5"
          >
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-3 text-yellow-800 text-sm text-center max-w-sm">
              🔒 Admin panel is secured - First enter your username and admin-password to verify
            </div>

            <div className="flex flex-col gap-4 w-64 md:w-80 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-gray-700 font-medium text-sm">Admin Username</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800"
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-700 font-medium text-sm">Admin Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800"
                    placeholder="Enter admin-Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {credError && (
              <p className="text-red-500 text-sm mt-1">{credError}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep("role")}
                className="py-3 px-6 rounded-2xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleCredentialsVerify}
                disabled={!username || !adminPassword || credLoading}
                className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-2xl shadow-md transition-all ${
                  username && adminPassword && !credLoading
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {credLoading ? "Verifying username & password..." : "Send OTP"}
                <ArrowRight />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: OTP Verify ── */}
        {step === "adminOtp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col items-center w-full mt-10 gap-5"
          >
            <div className="bg-green-50 border border-green-300 rounded-xl px-5 py-3 text-green-800 text-sm text-center max-w-sm">
              ✅ Credentials are correct! An 6-digit OTP has been sent to your email!
            </div>

            <div className="flex flex-col gap-1 w-64 md:w-80 mt-4">
              <label className="text-gray-700 font-medium text-sm">Enter OTP</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800 tracking-widest text-center text-xl"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            {otpError && (
              <p className="text-red-500 text-sm mt-1">{otpError}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setStep("adminCredentials")
                  setOtp("")
                  setOtpError("")
                }}
                className="py-3 px-6 rounded-2xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
              >
                Wapas
              </button>
              <button
                onClick={handleOtpVerify}
                disabled={otp.length !== 6 || otpLoading}
                className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-2xl shadow-md transition-all ${
                  otp.length === 6 && !otpLoading
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {otpLoading ? "Verifying username & Password..." : "Open Admin Panel"}
                <ShieldCheck />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EditRoleMobile
