'use client'
import { EyeIcon, EyeOff, Leaf, Loader2, Lock, LogIn, Mail } from 'lucide-react'
import React, { FormEvent, useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import Image from 'next/image'
import googleImage from '@/assets/Google.png'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'


type Step = "credentials" | "otp"

function Login() {
  const [step, setStep] = useState<Step>("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()

  // Step 1: Email + Password → OTP bhejo
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await axios.post("/api/auth/send-login-otp", { email, password })
      setStep("otp")
      startResendCooldown()
    } catch (err: any) {
      setError(err.response?.data?.message || "Kuch ghalat hua. Dobara try karein.")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: OTP verify → NextAuth signIn
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false,
      })
      if (result?.error) {
        setError("Entered Wrong OTP or has been Expired!")
      } else {
        router.refresh()           // pehle refresh — session set ho
        router.push("/")           // phir navigate
      }
    } catch {
      setError("Login mein masla aaya. Dobara try karein.")
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
      await axios.post("/api/auth/send-login-otp", { email, password })
      startResendCooldown()
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP has not been sent.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative'>

      <motion.h1
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className='text-4xl font-extrabold text-green-700 mb-2'
      >
        Welcome Back!
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className='text-gray-600 mb-8 flex items-center gap-1'
      >
        Login to IshyMart <Leaf className='w-5 h-5 text-green-600' />
      </motion.p>

      <AnimatePresence mode="wait">
        {/* ─── STEP 1: Email + Password ─── */}
        {step === "credentials" && (
          <motion.form
            key="credentials"
            onSubmit={handleSendOtp}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className='flex flex-col gap-5 w-full max-w-sm'
          >
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
                placeholder='Your Password'
                className='w-full border border-gray-300 rounded-xl py-3 pl-10 pr-10 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none'
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              {showPassword
                ? <EyeOff className='absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer' onClick={() => setShowPassword(false)} />
                : <EyeIcon className='absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer' onClick={() => setShowPassword(true)} />
              }

              {/* Forgot password link */}
            <div className="text-right mt-2">
              <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700 hover:underline">Password forgotten?</Link>
            </div>
            </div>

            {error && (
              <p className='text-red-500 text-sm text-center'>{error}</p>
            )}

            <button
              type="submit"
              disabled={!email || !password || loading}
              className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${
                email && password
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : "Send OTP"}
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

        {/* ─── STEP 2: OTP Input ─── */}
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
                OTP has been sent to your email
              </p>
              <p className='text-gray-600 text-sm mt-1'>
                <span className='font-semibold'>{email}</span> On this email 6-digit OTP has been sent!
              </p>
            </div>

            {/* OTP input boxes */}
            <div className='relative'>
              <input
                type="text"
                inputMode="numeric"
                placeholder='Please enter 6-digit OTP'
                maxLength={6}
                className='w-full border border-gray-300 rounded-xl py-3 px-4 text-gray-800 text-center tracking-widest text-xl font-bold focus:ring-2 focus:ring-green-500 focus:outline-none'
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "")
                  setOtp(val)
                  if (val.length === 6) signIn("credentials", { email, otp: val, redirect: false })
                    .then((result) => {
                      if (result?.error) setError("Entered Wrong OTP or has been Expired!")
                      else { router.refresh(); router.push("/") }
                    })
                }}
                value={otp}
                required
              />
            </div>

            {error && (
              <p className='text-red-500 text-sm text-center'>{error}</p>
            )}

            <button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 ${
                otp.length === 6
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : "Verify & Login"}
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
                onClick={() => { setStep("credentials"); setOtp(""); setError("") }}
                className='text-sm text-gray-500 hover:text-gray-700'
              >
                ← Change your Email/Password 
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
        onClick={() => router.push("/register")}
      >
        Not Have An Account? <LogIn className='w-4 h-4' /> <span className='text-green-600'>Sign Up</span>
      </motion.p>
    </div>
  )
}

export default Login
