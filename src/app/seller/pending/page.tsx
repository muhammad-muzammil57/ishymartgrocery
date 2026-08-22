'use client'
import { CheckCircle2, Clock, Loader, ShieldAlert, XCircle } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

function SellerPendingPage() {
  const router = useRouter()
  const [status, setStatus] = useState<string | null>(null)
  const [reason, setReason] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/api/seller/status')
      .then((res) => {
        setStatus(res.data.sellerStatus)
        setReason(res.data.application?.rejectionReason || res.data.sellerSuspendReason)
        if (res.data.sellerStatus === 'approved') {
          router.replace('/seller/dashboard')
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white py-24 px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white w-full max-w-lg shadow-2xl rounded-3xl border border-green-100 p-10 text-center"
      >
        {status === 'pending' && (
          <>
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Application Under Review</h1>
            <p className="text-gray-500 mb-6">
              Your seller application has been submitted and is being reviewed by our team.
              This usually takes <strong>3 to 4 days</strong>. We'll email you as soon as a
              decision is made.
            </p>
          </>
        )}

        {status === 'rejected' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Application Rejected</h1>
            {reason && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6 text-left">
                <strong>Reason: </strong>
                {reason}
              </div>
            )}
            <Link
              href="/seller/apply"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Apply Again
            </Link>
          </>
        )}

        {status === 'suspended' && (
          <>
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Seller Account Suspended</h1>
            {reason && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6 text-left">
                <strong>Reason: </strong>
                {reason}
              </div>
            )}
            <p className="text-gray-500">
              Your buyer account is unaffected. Contact support if you believe this is a mistake.
            </p>
          </>
        )}

        {status === 'none' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-gray-800 mb-2">No Application Found</h1>
            <Link
              href="/seller/apply"
              className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Apply to Sell
            </Link>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default SellerPendingPage
