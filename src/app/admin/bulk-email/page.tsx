'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import {
  Send, Users, Mail, AlertCircle, CheckCircle2,
  Loader2, Eye, EyeOff, ChevronDown, RotateCcw,
  ShieldAlert, Megaphone
} from 'lucide-react'

const ROLES = [
  { value: 'all', label: '👥 Sab Users', color: 'bg-blue-100 text-blue-700' },
  { value: 'user', label: '🙋 Customers', color: 'bg-green-100 text-green-700' },
  { value: 'deliveryBoy', label: '🚴 Delivery Boys', color: 'bg-orange-100 text-orange-700' },
  { value: 'admin', label: '🛡️ Admins', color: 'bg-purple-100 text-purple-700' },
]

type SendResult = {
  message: string
  sent: number
  failed: number
  total: number
  failedEmails: string[]
}

export default function BulkEmailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [targetRole, setTargetRole] = useState('all')
  const [userCount, setUserCount] = useState<number | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  // Auth check
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any).role !== 'admin') {
      router.push('/')
    }
  }, [session, status])

  // User count fetch when role changes
  useEffect(() => {
    setUserCount(null)
    axios.get(`/api/admin/send-bulk-email?role=${targetRole}`)
      .then(res => setUserCount(res.data.count))
      .catch(() => setUserCount(0))
  }, [targetRole])

  const handleSend = async () => {
    setConfirmOpen(false)
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await axios.post('/api/admin/send-bulk-email', {
        subject, body, targetRole
      })
      setResult(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email send nahi hua. Dobara try karein.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubject('')
    setBody('')
    setTargetRole('all')
    setResult(null)
    setError('')
    setShowPreview(false)
  }

  const isValid = subject.trim().length > 0 && body.trim().length > 0

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Bulk Email</h1>
              <p className="text-xs text-gray-500">Sab users ko email bhejein</p>
            </div>
          </div>
          <button onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium">
            ← Admin Panel
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Success result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className={`rounded-2xl border p-5 ${result.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className={`w-5 h-5 ${result.failed === 0 ? 'text-green-600' : 'text-yellow-600'}`} />
                <p className={`font-semibold ${result.failed === 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                  {result.message}
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-700">✅ Successful: <strong>{result.sent}</strong></span>
                {result.failed > 0 && (
                  <span className="text-red-600">❌ Failed: <strong>{result.failed}</strong></span>
                )}
                <span className="text-gray-500">📊 Total: <strong>{result.total}</strong></span>
              </div>
              {result.failedEmails?.length > 0 && (
                <details className="mt-3">
                  <summary className="text-xs text-red-500 cursor-pointer">Failed emails dekhein</summary>
                  <div className="mt-2 text-xs text-gray-500 bg-white rounded-lg p-2 border">
                    {result.failedEmails.join(', ')}
                  </div>
                </details>
              )}
              <button onClick={handleReset}
                className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                <RotateCcw className="w-4 h-4" /> Naya email likhein
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main form card */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Target audience */}
            <div className="p-6 border-b border-gray-100">
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" /> Kise bhejein?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ROLES.map(role => (
                  <button key={role.value}
                    onClick={() => setTargetRole(role.value)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all border-2 ${
                      targetRole === role.value
                        ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                    }`}
                  >{role.label}</button>
                ))}
              </div>

              {/* User count badge */}
              <div className="mt-3 flex items-center gap-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  ROLES.find(r => r.value === targetRole)?.color
                }`}>
                  <Mail className="w-3.5 h-3.5" />
                  {userCount === null
                    ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Count ho raha hai...</span>
                    : <span>{userCount} users ko jayegi</span>
                  }
                </div>
              </div>
            </div>

            {/* Email composer */}
            <div className="p-6 flex flex-col gap-4">
              {/* Subject */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Subject (Email ka title)
                </label>
                <input
                  type="text"
                  placeholder="jaise: IshyMart Special Offer 🎁"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  maxLength={100}
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{subject.length}/100</p>
              </div>

              {/* Body */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Email ka Content
                </label>
                <textarea
                  ref={bodyRef}
                  placeholder={`Assalam o Alaikum IshyMart Family!\n\nAaj hum aapko ek khaas khabar dena chahte hain...\n\nShukriya,\nIshyMart Team`}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={10}
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-800 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none leading-relaxed"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{body.length} characters</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                {/* Preview button */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={!isValid}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                    isValid
                      ? 'border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? 'Preview Band' : 'Preview Dekhein'}
                </button>

                {/* Send button */}
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={!isValid || loading || (userCount !== null && userCount === 0)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isValid && !loading && userCount && userCount > 0
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Email bheja ja raha hai...</>
                    : <><Send className="w-4 h-4" /> {userCount ? `${userCount} Users ko Bhejein` : 'Bhejein'}</>
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Email Preview */}
        <AnimatePresence>
          {showPreview && isValid && !result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-600" /> Email Preview
                </h3>
                <span className="text-xs text-gray-400">Aisa dikhega users ko</span>
              </div>

              {/* Simulated email */}
              <div className="p-6">
                <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: '520px', margin: '0 auto', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', padding: '28px 32px', textAlign: 'center' }}>
                    <h1 style={{ margin: 0, color: '#ffffff', fontSize: '22px', fontWeight: 800 }}>🛒 IshyMart</h1>
                    <p style={{ margin: '6px 0 0', color: '#bbf7d0', fontSize: '12px' }}>Fresh groceries delivered to your door</p>
                  </div>
                  <div style={{ padding: '28px 28px' }}>
                    <h2 style={{ color: '#15803d', margin: '0 0 14px', fontSize: '18px' }}>{subject}</h2>
                    <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{body}</div>
                  </div>
                  <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '16px 28px', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '11px' }}>
                      Yeh email IshyMart ki taraf se bheja gaya — <strong>{session?.user?.name}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips card */}
        {!result && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-blue-800 font-semibold text-sm mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Zaroori Tips
            </p>
            <ul className="text-blue-700 text-sm space-y-1.5 list-none">
              <li>📧 Gmail ka daily limit 500 emails hai — zyada users hain to batches mein bhejega</li>
              <li>⏱️ Har 10 emails ke baad 1 second ruka jayega — Gmail block na kare</li>
              <li>✍️ Subject mein emoji add karo — open rate barh jaati hai</li>
              <li>🙋 User ka naam automatically add nahi hoga — general text likhein</li>
            </ul>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Confirm karein?</h3>
              <p className="text-gray-500 text-sm text-center mb-1">
                Yeh email <strong>{userCount}</strong> users ko bheja jayega
              </p>
              <p className="text-gray-500 text-sm text-center mb-6">
                Subject: <strong>"{subject}"</strong>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmOpen(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                  Wapas
                </button>
                <button onClick={handleSend}
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm">
                  Haan, Bhejein!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
