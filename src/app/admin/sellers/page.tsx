'use client'
import axios from 'axios'
import { ArrowLeft, Loader, ShieldAlert, Store } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

function AdminSellersPage() {
  const router = useRouter()
  const [sellers, setSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/api/admin/sellers')
      .then((res) => setSellers(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className='min-h-screen bg-gray-50 w-full'>
      <div className='fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50'>
        <div className='max-w-5xl mx-auto flex items-center gap-4 px-4 py-3'>
          <button onClick={() => router.push('/')} className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition'>
            <ArrowLeft size={24} className='text-green-700' />
          </button>
          <h1 className='text-xl font-bold text-gray-800'>Sellers</h1>
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-4 pt-24 pb-16'>
        {loading ? (
          <Loader className='w-8 h-8 animate-spin text-green-600' />
        ) : sellers.length === 0 ? (
          <div className='bg-white rounded-2xl shadow p-8 text-center text-gray-500'>No sellers registered yet.</div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {sellers.map((s) => (
              <Link
                key={s._id}
                href={`/admin/sellers/${s._id}`}
                className='bg-white rounded-2xl shadow p-5 border border-gray-100 hover:shadow-lg transition flex flex-col items-center text-center'
              >
                <div className='relative w-16 h-16 rounded-full overflow-hidden bg-green-100 mb-3 flex items-center justify-center'>
                  {s.image ? <Image src={s.image} alt={s.name} fill className='object-cover' /> : <Store className='text-green-600' />}
                </div>
                <h3 className='font-bold text-gray-800'>{s.storeName || s.name}</h3>
                <p className='text-xs text-gray-500'>{s.email}</p>
                <span
                  className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                    s.sellerStatus === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {s.sellerStatus === 'suspended' && <ShieldAlert className='inline w-3 h-3 mr-1' />}
                  {s.sellerStatus}
                </span>
                <p className='text-xs text-gray-400 mt-2'>Balance: Rs {s.sellerBalance || 0}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSellersPage
