'use client'
import axios from 'axios'
import { ArrowLeft, Loader, Phone, Truck } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import OrderChatWidget from '@/components/OrderChatWidget'
import { getSocket, disconnectSocket } from '@/app/lib/socket'

const LiveTrackingMap = dynamic(() => import('@/components/LiveTrackingMap'), { ssr: false })

const steps = ['pending', 'out of delivery', 'delivered']

function TrackOrderPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchTracking = async () => {
    try {
      const res = await axios.get(`/api/user/order/${orderId}/track`)
      setData(res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  // ─── Ek dafa initial data le lo, us k baad koi polling nahi — sab kuch
  // real-time Socket.IO se aayega ─────────────────────────────────────
  useEffect(() => {
    fetchTracking()
  }, [orderId])

  // ─── Real-time: order room join karo, location aur status updates
  // seedhe socket server se sunо (pehle yahan har 4 second baad poll
  // hota tha) ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return
    const socket = getSocket()
    socket.connect()
    socket.emit('order:join', { orderId })

    socket.on('order:locationUpdate', ({ latitude, longitude, updatedAt }: any) => {
      setData((prev: any) =>
        prev ? { ...prev, currentLocation: { latitude, longitude, updatedAt } } : prev
      )
    })

    socket.on('order:statusUpdate', ({ status, deliveryBoy, cancelReason }: any) => {
      setData((prev: any) => {
        if (!prev) return prev
        return {
          ...prev,
          status: status ?? prev.status,
          deliveryBoy: deliveryBoy ?? prev.deliveryBoy,
          cancelReason: cancelReason ?? prev.cancelReason,
        }
      })
    })

    return () => {
      socket.emit('order:leave', { orderId })
      socket.off('order:locationUpdate')
      socket.off('order:statusUpdate')
      disconnectSocket()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Order not found</div>
  }

  const currentStepIndex = steps.indexOf(data.status)

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition">
            <ArrowLeft size={24} className="text-green-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Track Order</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        {data.status === 'cancelled' ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 font-semibold">
            This order has been cancelled.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                {steps.map((s, i) => (
                  <div key={s} className="flex-1 flex flex-col items-center relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                        i <= currentStepIndex ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs mt-2 capitalize text-center">{s}</span>
                    {i < steps.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-0.5 ${
                          i < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {data.deliveryBoy && (
              <div className="bg-white rounded-2xl shadow p-5 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{data.deliveryBoy.name}</p>
                    <p className="text-xs text-gray-500">Your delivery partner</p>
                  </div>
                </div>
                {data.deliveryBoy.mobile && (
                  <a
                    href={`tel:${data.deliveryBoy.mobile}`}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-full text-sm"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </a>
                )}
              </div>
            )}

            {data.status === 'out of delivery' && (
              <div className="bg-white rounded-2xl shadow p-4 mb-6">
                <LiveTrackingMap
                  deliveryLocation={data.currentLocation}
                  destination={
                    data.address?.latitude
                      ? { latitude: data.address.latitude, longitude: data.address.longitude }
                      : null
                  }
                />
                {!data.currentLocation && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Waiting for delivery partner's live location...
                  </p>
                )}
              </div>
            )}

            {data.deliveryBoy && data.status === 'out of delivery' && (
              <OrderChatWidget orderId={orderId} role="buyer" />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TrackOrderPage
