'use client'
import axios from 'axios'
import { ArrowLeft, CheckCircle2, Loader, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'

const tabs = ['pending', 'approved', 'rejected', 'all']

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

function AdminWithdrawalsPage() {
  const router = useRouter()
  const [tab, setTab] = useState('pending')
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchWithdrawals = async (status: string) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/admin/withdrawals?status=${status}`)
      setWithdrawals(res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals(tab)
  }, [tab])

  const decide = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    setActingId(id)
    try {
      await axios.post(`/api/admin/withdrawals/${id}/decision`, { action, reason })
      setRejectingId(null)
      setRejectReason('')
      fetchWithdrawals(tab)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to record decision')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 w-full'>
      <div className='fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50'>
        <div className='max-w-4xl mx-auto flex items-center gap-4 px-4 py-3'>
          <button onClick={() => router.push('/')} className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition'>
            <ArrowLeft size={24} className='text-green-700' />
          </button>
          <h1 className='text-xl font-bold text-gray-800'>Withdrawal Requests</h1>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 pt-24 pb-16'>
        <div className='flex gap-2 mb-6'>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
                tab === t ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader className='w-8 h-8 animate-spin text-green-600' />
        ) : withdrawals.length === 0 ? (
          <div className='bg-white rounded-2xl shadow p-8 text-center text-gray-500'>No withdrawal requests here.</div>
        ) : (
          <div className='flex flex-col gap-4'>
            {withdrawals.map((w) => (
              <motion.div
                key={w._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white rounded-2xl shadow p-6 border border-gray-100'
              >
                <div className='flex items-center justify-between mb-2'>
                  <div>
                    <h3 className='font-bold text-lg text-gray-800'>{w.seller?.storeName || w.seller?.name}</h3>
                    <p className='text-sm text-gray-500'>{w.seller?.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[w.status]}`}>
                    {w.status}
                  </span>
                </div>
                <p className='text-2xl font-extrabold text-green-700 mb-2'>Rs {w.amount}</p>
                <p className='text-xs text-gray-400 mb-2'>Requested: {new Date(w.createdAt).toLocaleString()}</p>
                {w.status === 'rejected' && w.rejectionReason && (
                  <p className='text-xs text-red-600 mb-2'>Reason: {w.rejectionReason}</p>
                )}

                {w.status === 'pending' && (
                  <div className='border-t pt-4 mt-2'>
                    {rejectingId === w._id ? (
                      <div className='flex flex-col gap-2'>
                        <textarea
                          className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                          placeholder='Reason for rejection...'
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className='flex gap-2'>
                          <button
                            disabled={actingId === w._id || !rejectReason.trim()}
                            onClick={() => decide(w._id, 'reject', rejectReason)}
                            className='bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg'
                          >
                            Confirm Reject
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason('') }}
                            className='bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg'
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex gap-3'>
                        <button
                          disabled={actingId === w._id}
                          onClick={() => decide(w._id, 'approve')}
                          className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg'
                        >
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(w._id)}
                          className='flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg'
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminWithdrawalsPage
