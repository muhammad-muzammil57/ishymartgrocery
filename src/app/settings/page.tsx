'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import {
  Camera, User, Mail, Phone, Lock, Eye, EyeOff,
  Loader2, CheckCircle2, AlertCircle, LogOut,
  ShieldCheck, Pencil, X, Save
} from 'lucide-react'
import Image from 'next/image'

// ── Types ──────────────────────────────────────────────
type AlertType = { type: 'success' | 'error'; message: string } | null

// ── Alert component ────────────────────────────────────
function Alert({ alert, onClose }: { alert: AlertType; onClose: () => void }) {
  useEffect(() => {
    if (!alert) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [alert, onClose])

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium ${
            alert.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {alert.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {alert.message}
          <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main Settings Page ─────────────────────────────────
export default function SettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (session === null) router.push('/login')
  }, [session, router])

  const [alert, setAlert] = useState<AlertType>(null)

  // ── Profile info state ──
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [nameLoading, setNameLoading] = useState(false)

  // ── Image state ──
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Password state ──
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Prefill from session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setMobile((session.user as any).mobile || '')
    }
  }, [session])

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
  }

  // ── Image select & upload ──
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', 'Image must br less then 5MB !')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload to Cloudinary
    setImageLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await axios.post('/api/user/upload-image', formData)
      const imageUrl = res.data.imageUrl

      // Save to DB
      await axios.patch('/api/user/update-profile', { image: imageUrl })

      // Update session
      await update({ image: imageUrl })
      showAlert('success', 'Profile photo has been updated!')
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Image upload nahi hua.')
      setImagePreview(null)
    } finally {
      setImageLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Save name & mobile ──
  const handleSaveProfile = async () => {
    setNameLoading(true)
    try {
      const res = await axios.patch('/api/user/update-profile', { name, mobile })
      await update({ name: res.data.user.name })
      showAlert('success', 'Profile has been Updated!')
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Does Not Update.')
    } finally {
      setNameLoading(false)
    }
  }

  // ── Save password ──
  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      showAlert('error', 'Does not match old and new password!')
      return
    }
    setPasswordLoading(true)
    try {
      const isGoogleUser = !session?.user && (session as any)?.user?.password === undefined
      await axios.patch('/api/user/update-profile', {
        currentPassword: currentPassword || undefined,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showAlert('success', 'Password has been updated!')
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Password has not been updated.')
    } finally {
      setPasswordLoading(false)
    }
  }

  // ── Detect Google user — fetch from API ──
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  useEffect(() => {
    if (!session?.user) return
    axios.get('/api/user/profile').then((res) => {
      setHasPassword(res.data.hasPassword)
      setMobile(res.data.mobile || '')
    }).catch(() => setHasPassword(false))
  }, [session])
  const isGoogleUser = hasPassword === false

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  const currentImage = imagePreview || session.user?.image || null
  const userInitials = (session.user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      <Alert alert={alert} onClose={() => setAlert(null)} />

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-500">{session.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* ── Profile Photo Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Camera className="w-4 h-4 text-green-600" /> Profile Photo
          </h2>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-green-100 border-4 border-white shadow-md flex items-center justify-center">
                {imageLoading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-green-600" />
                ) : currentImage ? (
                  <Image
                    src={currentImage}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-green-700">{userInitials}</span>
                )}
              </div>

              {/* Camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
              >
                <Pencil className="w-3.5 h-3.5 text-white" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div>
              <p className="font-semibold text-gray-800 text-lg">{session.user?.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{session.user?.email}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
              >
                {imageLoading ? 'Uploading You Image...' : 'Change Your Photo'}
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG - max 5MB</p>
            </div>
          </div>
        </motion.div>

        {/* ── Personal Info Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-green-600" /> Personal Info
          </h2>

          <div className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Your Name..."
                  className="w-full border border-gray-200 rounded-xl py-3 pl-9 pr-4 text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email — read only */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={session.user?.email || ''}
                  readOnly
                  className="w-full border border-gray-100 bg-gray-50 rounded-xl py-3 pl-9 pr-4 text-gray-400 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">You Can't Change Your Email</p>
            </div>

            {/* Mobile */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="03xxxxxxxxx"
                  maxLength={15}
                  className="w-full border border-gray-200 rounded-xl py-3 pl-9 pr-4 text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={nameLoading || (!name.trim() && mobile === ((session.user as any)?.mobile || ''))}
              className={`w-full py-3 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 ${
                !nameLoading
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {nameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {nameLoading ? 'We are saving your changes...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>

        {/* ── Password Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600" />
            {isGoogleUser ? 'Set Your Password' : 'Change Your Password'}
          </h2>

          {isGoogleUser && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 mt-3">
              <ShieldCheck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-600">
              You can log in using Google. You can also enable email/password login by setting a password.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-4">
            {/* Current password — sirf tab show karo jab Google user nahi */}
            {!isGoogleUser && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Old Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter Your Old Password"
                    className="w-full border border-gray-200 rounded-xl py-3 pl-9 pr-10 text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-3.5">
                    {showCurrentPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            )}

            {/* New password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min. 8 characters)"
                  className="w-full border border-gray-200 rounded-xl py-3 pl-9 pr-10 text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-3.5">
                  {showNewPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        newPassword.length >= (i + 1) * 3
                          ? newPassword.length < 8
                            ? 'bg-orange-400'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-Enter Your Password..."
                  className="w-full border border-gray-200 rounded-xl py-3 pl-9 pr-10 text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-3.5">
                  {showConfirmPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <div className="absolute right-9 top-3.5">
                    {newPassword === confirmPassword
                      ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                      : <AlertCircle className="w-4 h-4 text-red-400" />
                    }
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSavePassword}
              disabled={
                passwordLoading ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword ||
                (!isGoogleUser && !currentPassword)
              }
              className={`w-full py-3 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 ${
                !passwordLoading && newPassword.length >= 8 && newPassword === confirmPassword
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {passwordLoading
                ? 'We are updating your password...'
                : isGoogleUser
                ? 'Set Your Password'
                : 'Update Your Password'}
            </button>
          </div>
        </motion.div>

        {/* ── Danger Zone ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-2xl border border-red-100 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-red-600 mb-4 flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </h2>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full py-3 rounded-xl font-semibold text-sm text-red-600 border-2 border-red-200 hover:bg-red-50 transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log Out from all devices
          </button>
        </motion.div>

      </div>
    </div>
  )
}
