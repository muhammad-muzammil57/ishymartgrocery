'use client'
import axios from 'axios'
import { CheckCircle2, Loader, MapPin, Package, Phone, Power, Truck, X, TrendingUp, CalendarDays, CalendarRange } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react'
import OrderChatWidget from './OrderChatWidget'
import { getSocket, disconnectSocket } from '@/app/lib/socket'
import { useSession } from 'next-auth/react'

const LiveTrackingMap = dynamic(() => import('./LiveTrackingMap'), { ssr: false })

interface IStats {
  today: number
  lastWeek: number
  thisMonth: number
}

function DeliveryBoy() {
  const { data: session } = useSession()
  const [online, setOnline] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [activeOrder, setActiveOrder] = useState<any>(null)
  const [actingId, setActingId] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [stats, setStats] = useState<IStats>({ today: 0, lastWeek: 0, thisMonth: 0 })

  const watchIdRef = useRef<number | null>(null)
  const activeOrderRef = useRef<any>(null)
  useEffect(() => {
    activeOrderRef.current = activeOrder
  }, [activeOrder])

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/delivery/status')
      setOnline(res.data.isOnline)
    } finally {
      setCheckingStatus(false)
    }
  }

  const fetchBroadcasts = async () => {
    try {
      const res = await axios.get('/api/delivery/broadcasts')
      setBroadcasts(res.data)
    } catch {
      // ignore
    }
  }

  const fetchActiveOrder = async () => {
    try {
      const res = await axios.get('/api/delivery/my-active-order')
      setActiveOrder(res.data.order)
    } catch {
      // ignore
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/delivery/stats')
      setStats(res.data)
    } catch {
      // ignore
    }
  }

  // ─── Initial load — is k baad koi refresh/polling nahi, sab kuch
  // Socket.IO se real-time aata hai ───────────────────────────────────
  useEffect(() => {
    fetchStatus()
    fetchActiveOrder()
    fetchStats()
  }, [])

  // ─── Real-time: socket connect + naye order broadcasts, accept/reject
  // updates sunna. Pehle yahan har 4 second baad poll hota tha — ab
  // sirf server jab kuch hota hai tab hi push karta hai ────────────────
  useEffect(() => {
    if (!session?.user?.id) return

    const socket = getSocket()
    socket.connect()

    

    // Naya order broadcast aaya
    socket.on('delivery:newBroadcast', (assignment: any) => {
      setBroadcasts((prev) => {
        if (prev.some((b) => b._id === assignment._id)) return prev
        return [assignment, ...prev]
      })
    })

    // Kisi aur delivery boy ne accept kar liya — is list se hata do
    socket.on('delivery:broadcastTaken', ({ assignmentId }: { assignmentId: string }) => {
      setBroadcasts((prev) => prev.filter((b) => b._id !== assignmentId))
    })

    // Apna order deliver ho gaya (khud confirm karne k baad server confirm)
    socket.on('delivery:orderCompleted', () => {
      setActiveOrder(null)
      setOtpSent(false)
      setOtpCode('')
      fetchStats()
    })
          fetchStats()
      fetchBroadcasts()

    // Active order ka status kisi wajah se badla (e.g. admin ne cancel kiya)
    socket.on('order:statusUpdate', ({ status }: { status: string }) => {
      const current = activeOrderRef.current
      if (!current) return
      if (status === 'cancelled' || status === 'delivered') {
        setActiveOrder(null)
              if (status === 'cancelled' || status === 'delivered') {
        setActiveOrder(null)
        fetchBroadcasts()
      } else {
        setActiveOrder((prev: any) => (prev ? { ...prev, status } : prev))
      }
    })

    return () => {
      socket.off('delivery:newBroadcast')
      socket.off('delivery:broadcastTaken')
      socket.off('delivery:orderCompleted')
      socket.off('order:statusUpdate')
      disconnectSocket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])
    useEffect(() => {
    if (!session?.user?.id) return
    const socket = getSocket()
    if (online) {
      socket.emit('deliveryBoy:online', { deliveryBoyId: session.user.id })
      fetchBroadcasts()
    } else {
      socket.emit('deliveryBoy:offline')
    }
  }, [online, session?.user?.id])
  // Jab active order badle, us order ke room mein join/leave karo taa k
  // uski status updates real-time milti rahen
  useEffect(() => {
    if (!activeOrder?._id) return
    const socket = getSocket()
    socket.emit('order:join', { orderId: activeOrder._id })
    return () => {
      socket.emit('order:leave', { orderId: activeOrder._id })
    }
  }, [activeOrder?._id])

  // Active order ho to browser geolocation se live location bheji jaye
  // (Location POST hone k baad backend khud order ke room ko real-time
  // broadcast kar deta hai — buyer ka map turant move hota hai)
  useEffect(() => {
    if (activeOrder && activeOrder.status === 'out of delivery' && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          axios
            .post('/api/delivery/location', {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            })
            .catch(() => {})
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      )
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [activeOrder])

   const toggleOnline = async () => {
    const next = !online
    setOnline(next)
    try {
      await axios.post('/api/delivery/status', { isOnline: next })
      if (!next) {
        setBroadcasts([])
      }
    } catch {
      setOnline(!next)
    }
  }

  const accept = async (assignmentId: string) => {
    setActingId(assignmentId)
    try {
      await axios.post(`/api/delivery/assignment/${assignmentId}/accept`)
      await fetchActiveOrder()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to accept order')
    } finally {
      setActingId(null)
    }
  }

  const reject = async (assignmentId: string) => {
    setActingId(assignmentId)
    try {
      await axios.post(`/api/delivery/assignment/${assignmentId}/reject`)
      setBroadcasts((prev) => prev.filter((b) => b._id !== assignmentId))
    } finally {
      setActingId(null)
    }
  }

  const requestOtp = async () => {
    setOtpLoading(true)
    setOtpError('')
    try {
      await axios.post(`/api/delivery/order/${activeOrder._id}/request-otp`)
      setOtpSent(true)
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || 'Failed to send code')
    } finally {
      setOtpLoading(false)
    }
  }

  const confirmDelivery = async () => {
    setOtpLoading(true)
    setOtpError('')
    try {
      await axios.post(`/api/delivery/order/${activeOrder._id}/confirm-delivery`, { code: otpCode })
      setActiveOrder(null)
      setOtpSent(false)
      setOtpCode('')
      fetchStats()
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || 'Incorrect code')
    } finally {
      setOtpLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-white py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow p-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-800">Delivery Partner Dashboard</h1>
            <p className="text-sm text-gray-500">
              {online ? 'You are online and can receive orders' : 'Go online to start receiving orders'}
            </p>
          </div>
          <button
            onClick={toggleOnline}
            disabled={!!activeOrder}
            className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-full transition-colors ${
              online ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-60`}
          >
            <Power className="w-4 h-4" /> {online ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* ─── Delivery stats: aaj / pichla hafta / is mahine kitne order deliver kiye ─── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center text-center">
            <CalendarDays className="w-5 h-5 text-green-600 mb-1" />
            <p className="text-2xl font-extrabold text-gray-800">{stats.today}</p>
            <p className="text-xs text-gray-500 mt-0.5">Aaj Deliver Kiye</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center text-center">
            <CalendarRange className="w-5 h-5 text-amber-600 mb-1" />
            <p className="text-2xl font-extrabold text-gray-800">{stats.lastWeek}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pichle Hafte</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center text-center">
            <TrendingUp className="w-5 h-5 text-blue-600 mb-1" />
            <p className="text-2xl font-extrabold text-gray-800">{stats.thisMonth}</p>
            <p className="text-xs text-gray-500 mt-0.5">Is Mahine</p>
          </div>
        </div>

        {activeOrder ? (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="text-green-600 w-6 h-6" />
                <h2 className="font-bold text-gray-800">Active Delivery — Order #{activeOrder._id.slice(-6)}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                <MapPin className="w-4 h-4 text-green-600" /> {activeOrder.address.fullAddress}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-semibold text-gray-800">Buyer: {activeOrder.user?.name}</span>
                {activeOrder.address?.mobile && (
                  <a
                    href={`tel:${activeOrder.address.mobile}`}
                    className="flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    <Phone className="w-3 h-3" /> Call Buyer
                  </a>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {activeOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm bg-amber-50 rounded-lg px-3 py-2">
                    <span>{item.name} x {item.quantity}</span>
                    <span>Rs {(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <LiveTrackingMap
                  destination={
                    activeOrder.address?.latitude
                      ? { latitude: activeOrder.address.latitude, longitude: activeOrder.address.longitude }
                      : null
                  }
                  deliveryLocation={activeOrder.currentLocation}
                  height="260px"
                />
              </div>

              <div className="mt-5 border-t pt-4">
                {!otpSent ? (
                  <button
                    onClick={requestOtp}
                    disabled={otpLoading}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg"
                  >
                    <Package className="w-4 h-4" /> Mark as Delivered
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-600">
                      A confirmation code was emailed to the buyer. Ask them for it and enter below.
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        maxLength={6}
                        placeholder="6-digit code"
                        className="flex-1 border rounded-lg px-3 py-2 text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                      <button
                        onClick={confirmDelivery}
                        disabled={otpLoading || otpCode.length < 4}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 rounded-lg"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Confirm
                      </button>
                    </div>
                  </div>
                )}
                {otpError && <p className="text-red-600 text-xs mt-2">{otpError}</p>}
              </div>
            </div>

            <OrderChatWidget orderId={activeOrder._id} role="deliveryBoy" />
          </div>
        ) : online ? (
          <div className="bg-white rounded-3xl shadow p-6">
            <h2 className="font-bold text-gray-800 mb-4">Incoming Orders</h2>
            {broadcasts.length === 0 ? (
              <p className="text-gray-500 text-sm">No new orders right now. Stay online to receive notifications.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {broadcasts.map((b) => (
                  <div key={b._id} className="border border-amber-200 bg-amber-50 rounded-2xl p-4">
                    <p className="font-bold text-gray-800">Order #{b.order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-amber-600" /> {b.order.address.fullAddress}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Rs {b.order.totalAmount} · {b.order.items.length} item(s)</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        disabled={actingId === b._id}
                        onClick={() => accept(b._id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept
                      </button>
                      <button
                        disabled={actingId === b._id}
                        onClick={() => reject(b._id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-600 text-sm font-semibold py-2 rounded-lg"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow p-8 text-center text-gray-500">
            You are offline. Toggle "Online" above to start receiving delivery notifications.
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryBoy
