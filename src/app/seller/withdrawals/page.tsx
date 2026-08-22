'use client'
import { Loader, Wallet, Clock, CheckCircle2, XCircle } from 'lucide-react'
import React, { FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const statusMeta: Record<string, { icon: any; color: string }> = {
  pending: { icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  approved: { icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-200' },
  rejected: { icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
}

function SellerWithdrawalsPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [earnings, setEarnings] = useState<{ totalEarned: number; availableBalance: number; pendingWithdrawalAmount: number } | null>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const refresh = async () => {
    const [e, w] = await Promise.all([
      axios.get('/api/seller/earnings'),
      axios.get('/api/seller/withdraw'),
    ])
    setEarnings(e.data)
    setWithdrawals(w.data)
  }

  useEffect(() => {
    axios
      .get('/api/seller/status')
      .then((res) => {
        if (res.data.sellerStatus !== 'approved') {
          router.replace('/seller/apply')
          return
        }
        return refresh()
      })
      .finally(() => setChecking(false))
  }, [router])

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Enter a valid amount')
      return
    }
    setSubmitting(true)
    try {
      await axios.post('/api/seller/withdraw', { amount: numAmount })
      setAmount('')
      await refresh()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit withdrawal request')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  const hasPending = withdrawals.some((w) => w.status === 'pending')

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-white py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="text-green-600 w-7 h-7" />
          <h1 className="text-2xl font-extrabold text-green-700">Earnings & Withdraw</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 mb-1">Total Earned</p>
            <p className="text-2xl font-extrabold text-green-700">Rs {earnings?.totalEarned ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 mb-1">Available Balance</p>
            <p className="text-2xl font-extrabold text-green-700">Rs {earnings?.availableBalance ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-500 mb-1">Pending Withdrawal</p>
            <p className="text-2xl font-extrabold text-amber-600">Rs {earnings?.pendingWithdrawalAmount ?? 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 mb-8">
          <h2 className="font-bold text-gray-800 mb-4">Request Withdrawal</h2>
          {hasPending ? (
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
              You already have a pending withdrawal request. Please wait for admin's decision.
            </p>
          ) : (
            <form onSubmit={handleWithdraw} className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                placeholder="Amount (Rs)"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : 'Withdraw'}
              </button>
            </form>
          )}
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="font-bold text-gray-800 mb-4">Withdrawal History</h2>
          {withdrawals.length === 0 ? (
            <p className="text-gray-500 text-sm">No withdrawal requests yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {withdrawals.map((w) => {
                const meta = statusMeta[w.status]
                const Icon = meta.icon
                return (
                  <div key={w._id} className={`flex items-center justify-between border rounded-xl px-4 py-3 ${meta.color}`}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-semibold">Rs {w.amount}</span>
                      <span className="capitalize text-xs">({w.status})</span>
                    </div>
                    {w.status === 'rejected' && w.rejectionReason && (
                      <span className="text-xs italic">{w.rejectionReason}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerWithdrawalsPage
