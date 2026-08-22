'use client'
import { ArrowLeft, EyeIcon, EyeOff, Leaf, Loader2, Lock, LogIn, Mail, User } from 'lucide-react'
import React, { useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import Image from 'next/image'
import googleImage from '@/assets/Google.png'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

type propType = {
  previousStep: (s: number) => void
}

type Step = "form" | "otp"

function RegisterForm({ previousStep }: propType) {
  const [step, setStep] = useState<Step>("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()

  // Step 1: Form submit → OTP bhejo
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await axios.post("/api/auth/send-register-otp", { name, email, password })
      setStep("otp")
      startResendCooldown()
    } catch (err: any) {
      setError(err.response?.data?.message || "Kuch ghalat hua. Dobara try karein.")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: OTP verify → User DB mein save → Login page
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await axios.post("/api/auth/verify-register-otp", { email, otp })
      const result = await signIn("credentials", {
        email,
        otp: "first_time_register",
        redirect: false,
      })
      console.log("signIn result:", result) // debug ke liye
      if (result?.ok) {
        window.location.href = "/"  // router.push ki jagah hard redirect
      } else {
        setError("Auto login failed. Please login manually.")
        window.location.href = "/login"
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Entered Wrong OTP or has been Expired!")
    } finally {
      setLoading(false)
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    setError("")
    try {
      await axios.post("/api/auth/send-register-otp", { name, email, password })
      startResendCooldown()
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP has not been sent.")
    } finally {
      setLoading(false)
    }
  }

  const formValid = name !== "" && email !== "" && password.length >= 8

  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative'>

      {/* Back button */}
      {step === "form" && (
        <div
          className='absolute top-6 left-6 flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors cursor-pointer'
          onClick={() => previousStep(1)}
        >
          <ArrowLeft className='w-5 h-5' />
          <span className='font-medium'>Back</span>
        </div>
      )}

      <motion.h1
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className='text-4xl font-extrabold text-green-700 mb-2'
      >
        {step === "form" ? "Create Account" : "Verify Email"}
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className='text-gray-600 mb-8 flex items-center gap-1'
      >
        {step === "form"
          ? <>Join IshyMart today <Leaf className='w-5 h-5 text-green-600' /></>
          : "Enter OTP and Verify & Activate Your Account!"
        }
      </motion.p>

      <AnimatePresence mode="wait">
        {/* ─── STEP 1: Registration Form ─── */}
        {step === "form" && (
          <motion.form
            key="form"
            onSubmit={handleSendOtp}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className='flex flex-col gap-5 w-full max-w-sm'
          >
            {/* Name */}
            <div className='relative'>
              <User className='absolute left-3 top-3.5 w-5 h-5 text-gray-400' />
              <input
                type="text"
                placeholder='Your Name'
                className='w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none'
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>

            {/* Email */}
            <div className='relative'>
              <Mail className='absolute left-3 top-3.5 w-5 h-5 text-gray-400' />
              <input
                type="email"
                placeholder='Your Email'
                className='w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none'
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>

            {/* Password */}
            <div className='relative'>
              <Lock className='absolute left-3 top-3.5 w-5 h-5 text-gray-400' />
              <input
                type={showPassword ? "text" : "password"}
                placeholder='Password (min. 8 characters)'
                className='w-full border border-gray-300 rounded-xl py-3 pl-10 pr-10 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none'
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              {showPassword
                ? <EyeOff className='absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer' onClick={() => setShowPassword(false)} />
                : <EyeIcon className='absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer' onClick={() => setShowPassword(true)} />
              }
            </div>

            {/* Password strength hint */}
            {password.length > 0 && password.length < 8 && (
              <p className='text-orange-500 text-xs -mt-3'>
                Password must be 8 characters!
              </p>
            )}

            {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

            <button
              type="submit"
              disabled={!formValid || loading}
              className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${
                formValid
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : "Send OTP & Register"}
            </button>

            <div className='flex items-center gap-2 text-gray-400 text-sm'>
              <span className='flex-1 h-px bg-gray-200'></span>
              OR
              <span className='flex-1 h-px bg-gray-200'></span>
            </div>

            <div
              className='cursor-pointer w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-gray-700 font-medium transition-all duration-200'
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <Image src={googleImage} width={20} height={20} alt='Google' />
              Continue With Google
            </div>
          </motion.form>
        )}

        {/* ─── STEP 2: OTP Verification ─── */}
        {step === "otp" && (
          <motion.form
            key="otp"
            onSubmit={handleVerifyOtp}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className='flex flex-col gap-5 w-full max-w-sm'
          >
            <div className='bg-green-50 border border-green-200 rounded-xl p-4 text-center'>
              <p className='text-green-700 font-medium text-sm'>
                OTP has been sent!
              </p>
              <p className='text-gray-600 text-sm mt-1'>
                <span className='font-semibold'>{email}</span> On this email 6-digit OTP has been sent!
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              placeholder='Please enter 6-digit OTP'
              maxLength={6}
              className='w-full border border-gray-300 rounded-xl py-3 px-4 text-gray-800 text-center tracking-widest text-xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none'
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "")
                setOtp(val)
                if (val.length === 6) {
                  setLoading(true)
                  setError("")
                  axios.post("/api/auth/verify-register-otp", { email, otp: val })
                    .then(() => signIn("credentials", { email, otp: "first_time_register", redirect: false }))
                    .then((result) => {
                      if (result?.ok) window.location.href = "/"
                      else window.location.href = "/login"
                    })
                    .catch((err: any) => setError(err.response?.data?.message || "Wrong OTP!"))
                    .finally(() => setLoading(false))
                }
              }}
              value={otp}
              required
            />

            {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

            <button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${
                otp.length === 6
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : "Verify & Create Account"}
            </button>

            <div className='flex flex-col items-center gap-2'>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className={`text-sm ${
                  resendCooldown > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-green-600 hover:underline cursor-pointer"
                }`}
              >
                {resendCooldown > 0
                  ? `Send OTP Again? (${resendCooldown}s)`
                  : "Send OTP Again?"}
              </button>

              <button
                type="button"
                onClick={() => { setStep("form"); setOtp(""); setError("") }}
                className='text-sm text-gray-500 hover:text-gray-700'
              >
                ← Fill the form again
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='text-gray-600 mt-6 text-sm flex items-center gap-1 cursor-pointer'
        onClick={() => router.push("/login")}
      >
        Already have an account? <LogIn className='w-4 h-4' /> <span className='text-green-600'>Sign In</span>
      </motion.p>
    </div>
  )
}

export default RegisterForm
