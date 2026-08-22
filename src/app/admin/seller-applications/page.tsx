'use client'
import axios from 'axios'
import { ArrowLeft, CheckCircle2, ExternalLink, Loader, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'

const tabs = ['pending', 'approved', 'rejected', 'all']

function AdminSellerApplicationsPage() {
  const router = useRouter()
  const [tab, setTab] = useState('pending')
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchApplications = async (status: string) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/admin/seller-applications?status=${status}`)
      setApplications(res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications(tab)
  }, [tab])

  const decide = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    setActingId(id)
    try {
      await axios.post(`/api/admin/seller-applications/${id}/decision`, { action, reason })
      setRejectingId(null)
      setRejectReason('')
      fetchApplications(tab)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to record decision')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 w-full'>
      <div className='fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50'>
        <div className='max-w-5xl mx-auto flex items-center gap-4 px-4 py-3'>
          <button onClick={() => router.push('/')} className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition'>
            <ArrowLeft size={24} className='text-green-700' />
          </button>
          <h1 className='text-xl font-bold text-gray-800'>Seller Applications</h1>
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-4 pt-24 pb-16'>
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
        ) : applications.length === 0 ? (
          <div className='bg-white rounded-2xl shadow p-8 text-center text-gray-500'>No applications here.</div>
        ) : (
          <div className='flex flex-col gap-4'>
            {applications.map((app) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white rounded-2xl shadow p-6 border border-gray-100'
              >
                <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
                  <div>
                    <h3 className='font-bold text-lg text-gray-800'>{app.fullName}</h3>
                    <p className='text-sm text-gray-500'>Store: {app.storeName}</p>
                    <p className='text-sm text-gray-500'>Applicant: {app.user?.name} ({app.user?.email})</p>
                    <p className='text-sm text-gray-500'>Phone: {app.phone}</p>
                    <p className='text-sm text-gray-500 mt-1'>Address: {app.address}</p>
                    <p className='text-xs text-gray-400 mt-1'>Submitted: {new Date(app.createdAt).toLocaleString()}</p>
                    {app.status === 'rejected' && app.rejectionReason && (
                      <p className='text-xs text-red-600 mt-2'>Reason: {app.rejectionReason}</p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2 min-w-[220px]'>
                    <a href={app.bankDocument} target='_blank' rel='noreferrer' className='flex items-center gap-2 text-sm text-green-700 hover:underline'>
                      <ExternalLink size={14} /> View Bank Document
                    </a>
                    <a href={app.utilityBill} target='_blank' rel='noreferrer' className='flex items-center gap-2 text-sm text-green-700 hover:underline'>
                      <ExternalLink size={14} /> View Electricity Bill
                    </a>
                    <a href={app.idDocument} target='_blank' rel='noreferrer' className='flex items-center gap-2 text-sm text-green-700 hover:underline'>
                      <ExternalLink size={14} /> View ID Document
                    </a>
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className='border-t pt-4 mt-4'>
                    {rejectingId === app._id ? (
                      <div className='flex flex-col gap-2'>
                        <textarea
                          className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                          placeholder='Reason for rejection...'
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className='flex gap-2'>
                          <button
                            disabled={actingId === app._id || !rejectReason.trim()}
                            onClick={() => decide(app._id, 'reject', rejectReason)}
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
                          disabled={actingId === app._id}
                          onClick={() => decide(app._id, 'approve')}
                          className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg'
                        >
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(app._id)}
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

export default AdminSellerApplicationsPage
