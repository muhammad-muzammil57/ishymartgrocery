'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import Link from 'next/link'
import {
  Mail, KeyRound, Lock, EyeIcon, EyeOff,
  Loader2, CheckCircle2, ArrowLeft, ShieldCheck
} from 'lucide-react'

type Step = 'email' | 'otp' | 'newPassword' | 'done'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')

  // State
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const startCooldown = () => {
    setResendCooldown(60)
    const t = setInterval(() => {
      setResendCooldown(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 })
    }, 1000)
  }

  // ── Step 1: Email submit ──
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await axios.post('/api/auth/forgot-password', { email })
      setStep('otp')
      startCooldown()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kuch ghalat hua.')
    } finally { setLoading(false) }
  }

  // ── Step 2: OTP verify ──
  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    // OTP sirf verify karo — reset password step pe jayenge
    // (actual reset step 3 mein hoga)
    try {
      // Dry-run check: OTP valid hai ya nahi test karne ke liye
      // Hum yahan OTP save rakhte hain aur step 3 mein use karte hain
      if (otp.length !== 6) throw new Error('6-digit OTP daalen!')
      setStep('newPassword')
    } catch (err: any) {
      setError(err.message || 'OTP ghalat hai.')
    } finally { setLoading(false) }
  }

  // ── Step 3: New password + OTP verify together ──
  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Dono passwords match nahi karte!'); return
    }
    setLoading(true); setError('')
    try {
      await axios.post('/api/auth/reset-password', { email, otp, newPassword })
      setStep('done')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset nahi hua.')
      // Agar OTP ghalat tha toh wapas OTP step pe bhejo
      if (err.response?.data?.message?.includes('OTP')) {
        setStep('otp'); setOtp('')
      }
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setLoading(true); setError('')
    try {
      await axios.post('/api/auth/forgot-password', { email })
      startCooldown()
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP dobara send nahi hua.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10">

      {/* Back to login */}
      <Link href="/login"
        className="absolute top-6 left-6 flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Go To Back Login
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Lost Your Password?</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
          {step === 'email' && 'Enter Your Registered Email  - We will send you an OTP!'}
          {step === 'otp' && `OTP on this email ${email} has been sent!`}
          {step === 'newPassword' && 'Set Your New Password'}
          {step === 'done' && 'Password successfully reset!'}
        </p>
      </motion.div>

      {/* Progress dots */}
      {step !== 'done' && (
        <div className="flex items-center gap-2 mb-8">
          {(['email', 'otp', 'newPassword'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step === s ? 'bg-green-600 text-white scale-110 shadow-md'
                : ((['email', 'otp', 'newPassword'] as Step[]).indexOf(step) > i)
                  ? 'bg-green-200 text-green-700'
                  : 'bg-gray-100 text-gray-400'
              }`}>{i + 1}</div>
              {i < 2 && <div className={`w-8 h-0.5 transition-all duration-300 ${
                ((['email', 'otp', 'newPassword'] as Step[]).indexOf(step) > i) ? 'bg-green-400' : 'bg-gray-200'
              }`} />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ── STEP 1: Email ── */}
        {step === 'email' && (
          <motion.form key="email"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            onSubmit={handleEmailSubmit}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email" placeholder="Enter Your Registered Email Here..."
                value={email} onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={!email || loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                email && !loading ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {loading ? 'We are sending you an OTP...' : 'Send OTP'}
            </button>
          </motion.form>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 'otp' && (
          <motion.form key="otp"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            onSubmit={handleOtpSubmit}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <p className="text-red-700 font-medium text-sm">Password Reset OTP</p>
              <p className="text-gray-500 text-xs mt-1">
                <span className="font-semibold">{email}</span> On this email 6-digit OTP has been sent
              </p>
            </div>

            <input
              type="text" inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              className="w-full border border-gray-200 rounded-xl py-3 px-4 text-center tracking-widest text-2xl font-bold text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit" disabled={otp.length !== 6 || loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                otp.length === 6 && !loading ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Verify Your OTP
            </button>

            <div className="flex flex-col items-center gap-2">
              <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || loading}
                className={`text-sm ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:underline'}`}>
                {resendCooldown > 0 ? `Send Again (${resendCooldown}s)` : 'Send OTP Again'}
              </button>
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setError('') }}
                className="text-sm text-gray-400 hover:text-gray-600">
                ← Change Email
              </button>
            </div>
          </motion.form>
        )}

        {/* ── STEP 3: New Password ── */}
        {step === 'newPassword' && (
          <motion.form key="newPassword"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            onSubmit={handleResetSubmit}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            {/* New password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Naya Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="Naya password (min. 8 characters)"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl py-3 pl-9 pr-10 text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-3.5">
                  {showNewPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <EyeIcon className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      newPassword.length >= (i + 1) * 3
                        ? newPassword.length < 8 ? 'bg-orange-400' : 'bg-green-500'
                        : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="Enter Password Again"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl py-3 pl-9 pr-10 text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-3.5">
                  {showConfirmPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <EyeIcon className="w-4 h-4 text-gray-400" />}
                </button>
                {confirmPassword.length > 0 && (
                  <div className="absolute right-9 top-3.5">
                    {newPassword === confirmPassword
                      ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                      : <KeyRound className="w-4 h-4 text-red-400" />}
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit"
              disabled={newPassword.length < 8 || newPassword !== confirmPassword || loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                newPassword.length >= 8 && newPassword === confirmPassword && !loading
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {loading ? 'Reseting Your Password...' : 'Reset Your Password '}
            </button>
          </motion.form>
        )}

        {/* ── STEP 4: Done ── */}
        {step === 'done' && (
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm text-center flex flex-col items-center gap-5"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Password Has Been Reset!</h2>
              <p className="text-gray-500 text-sm mt-2">
               Now You Can Loggin With Your New Password.
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all inline-flex items-center justify-center gap-2"
            >
             Go To Login Page →
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
