'use client'
import { Loader, Package } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  'out of delivery': 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
}

function SellerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/api/seller/status')
      .then((res) => {
        if (res.data.sellerStatus !== 'approved') {
          router.replace('/seller/apply')
          return
        }
        return axios.get('/api/seller/orders').then((r) => setOrders(r.data))
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
    <div className="min-h-screen bg-linear-to-br from-green-50 to-white py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Package className="text-green-600 w-7 h-7" />
          <h1 className="text-2xl font-extrabold text-green-700">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow p-8 text-center text-gray-500">
            No orders yet for your products.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">Order #{order._id.slice(-8)}</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Buyer: <strong>{order.user?.name}</strong>
                </div>
                <div className="flex flex-col gap-1">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-700">
                      <span>{item.name} x {item.quantity}</span>
                      <span>Rs {(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerOrdersPage
