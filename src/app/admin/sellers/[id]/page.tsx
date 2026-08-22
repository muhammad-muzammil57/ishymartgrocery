'use client'
import axios from 'axios'
import { ArrowLeft, Loader, ShieldAlert, ShieldCheck, Store } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

function AdminSellerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [seller, setSeller] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuspendForm, setShowSuspendForm] = useState(false)
  const [reason, setReason] = useState('')
  const [acting, setActing] = useState(false)

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/admin/sellers/${id}`)
      setSeller(res.data.seller)
      setProducts(res.data.products)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSuspend = async () => {
    if (!reason.trim()) return
    setActing(true)
    try {
      await axios.post(`/api/admin/sellers/${id}/suspend`, { action: 'suspend', reason })
      setShowSuspendForm(false)
      setReason('')
      fetchDetail()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to suspend seller')
    } finally {
      setActing(false)
    }
  }

  const handleReinstate = async () => {
    setActing(true)
    try {
      await axios.post(`/api/admin/sellers/${id}/suspend`, { action: 'reinstate' })
      fetchDetail()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reinstate seller')
    } finally {
      setActing(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader className='w-8 h-8 animate-spin text-green-600' />
      </div>
    )
  }

  if (!seller) {
    return <div className='min-h-screen flex items-center justify-center text-gray-500'>Seller not found</div>
  }

  return (
    <div className='min-h-screen bg-gray-50 w-full'>
      <div className='fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50'>
        <div className='max-w-5xl mx-auto flex items-center gap-4 px-4 py-3'>
          <button onClick={() => router.push('/admin/sellers')} className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition'>
            <ArrowLeft size={24} className='text-green-700' />
          </button>
          <h1 className='text-xl font-bold text-gray-800'>Seller Detail</h1>
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-4 pt-24 pb-16'>
        <div className='bg-white rounded-3xl shadow p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='relative w-16 h-16 rounded-full overflow-hidden bg-green-100 flex items-center justify-center'>
              {seller.image ? <Image src={seller.image} alt={seller.name} fill className='object-cover' /> : <Store className='text-green-600' />}
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-800'>{seller.storeName || seller.name}</h2>
              <p className='text-sm text-gray-500'>{seller.name} · {seller.email}</p>
              <p className='text-sm text-gray-500'>Balance: Rs {seller.sellerBalance || 0}</p>
              <span
                className={`inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                  seller.sellerStatus === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {seller.sellerStatus}
              </span>
              {seller.sellerStatus === 'suspended' && seller.sellerSuspendReason && (
                <p className='text-xs text-red-600 mt-1'>Reason: {seller.sellerSuspendReason}</p>
              )}
            </div>
          </div>

          <div>
            {seller.sellerStatus === 'approved' && !showSuspendForm && (
              <button
                onClick={() => setShowSuspendForm(true)}
                className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg'
              >
                <ShieldAlert size={16} /> Suspend Seller Account
              </button>
            )}
            {seller.sellerStatus === 'suspended' && (
              <button
                onClick={handleReinstate}
                disabled={acting}
                className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg'
              >
                <ShieldCheck size={16} /> Reinstate Seller
              </button>
            )}
          </div>
        </div>

        {showSuspendForm && (
          <div className='bg-white rounded-2xl shadow p-6 mb-8 border border-red-100'>
            <p className='font-semibold text-gray-800 mb-2'>Suspension Reason</p>
            <textarea
              className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-3'
              placeholder='Explain why this seller account is being suspended...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className='flex gap-2'>
              <button
                onClick={handleSuspend}
                disabled={acting || !reason.trim()}
                className='bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg'
              >
                Confirm Suspend
              </button>
              <button
                onClick={() => { setShowSuspendForm(false); setReason('') }}
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg'
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className='bg-white rounded-3xl shadow p-6'>
          <h3 className='font-bold text-gray-800 mb-4'>Products ({products.length})</h3>
          {products.length === 0 ? (
            <p className='text-gray-500 text-sm'>This seller hasn't listed any products yet.</p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
              {products.map((p) => (
                <div key={p._id} className='border border-gray-100 rounded-2xl p-4'>
                  {p.image && (
                    <div className='relative w-full aspect-square mb-3'>
                      <Image src={p.image} alt={p.name} fill className='object-contain' />
                    </div>
                  )}
                  <h4 className='font-bold text-green-700'>{p.name}</h4>
                  <p className='text-xs text-gray-500'>{p.category}</p>
                  <p className='text-green-700 font-semibold mt-1'>Rs {p.price} / {p.unit}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSellerDetailPage
