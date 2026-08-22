'use client'
import { IOrder } from '@/app/Models/order.model'
import React, { useState } from 'react'
import {motion} from "motion/react"
import { ChevronDown, ChevronUp, CreditCard, MapPin, Package, Star, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'

function FeedbackForm({ orderId, groceryId, onDone }: { orderId: string; groceryId: string; onDone: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await axios.post('/api/feedback', { orderId, groceryId, rating, comment })
      onDone()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-2 bg-white border border-amber-200 rounded-xl p-3">
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <Star className={`w-5 h-5 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
      <textarea
        className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
        rows={2}
        placeholder="Share your experience with this product (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      <button
        onClick={submit}
        disabled={submitting}
        className="mt-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  )
}

function ItemFeedback({ orderId, groceryId, initiallyGiven }: { orderId: string; groceryId: string; initiallyGiven?: boolean }) {
  const [open, setOpen] = useState(false)
  const [given, setGiven] = useState(!!initiallyGiven)

  if (given) {
    return <p className="text-xs text-green-600 mt-1">✓ Feedback submitted</p>
  }

  return open ? (
    <FeedbackForm orderId={orderId} groceryId={groceryId} onDone={() => { setGiven(true); setOpen(false) }} />
  ) : (
    <button onClick={() => setOpen(true)} className="text-xs text-amber-700 font-semibold mt-1 hover:underline">
      Leave feedback for seller
    </button>
  )
}

function UserOrderCard({order}:{order:IOrder}) {
  const [expended,setExpended]=useState(false)
  const getStatusColor=(status:string)=>{
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "out of delivery":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "delivered":
        return "bg-green-100 text-green-700 border-green-300"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300"
        
    
      default:
         return "bg-gray-100 text-gray-700 border-gray-300"
        
    }
  }
  return (
    <motion.div className='bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden'
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    >
      
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 px-5 py-4 bg-linear-to-r from-green-50 to-white'>
<div className=''>

  <h3 className='text-lg font-bold text-gray-800'>Order <span className='text-green-700 font-bold'>(#{order?._id?.toString().slice(-6)})</span></h3>

<p className='text-xs text-gray-500 mt-1'>{new Date(order.createdAt!).toLocaleString()}</p>
</div>
<div className='flex flex-wrap items-center gap-2'>
  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
    order.isPaid
    ?"bg-green-100 text-green-700 border-green-300"
    :"bg-red-100 text-red-700 border-red-300"
  }`}>
    {order.isPaid?"Paid":"UnPaid"}
  </span>

  <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor(
    order.status
  )}`}>
{order.status}
  </span>

  {order.status === 'out of delivery' && (
    <Link
      href={`/user/track-order/${order._id}`}
      className="px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white flex items-center gap-1"
    >
      <Truck size={12} /> Track Order
    </Link>
  )}

</div>
      </div>
      <div className='p-5 space-y-4'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 px-5 py-4 bg-linear-to-r from-green-50 to-white'>
          <div>
      {order.paymentMethod=="cod"? <div className={`px-3 py-1 text-xs font-semibold rounded-full  flex gap-2 ${
    order.isPaid
    ?"bg-green-100 text-green-700 border-green-300"
    :" text-red-700 "
  }`}>
          <Truck className='text-red-700' size={16}/>
          Cash On Delivery
        </div>: <div className={`px-3 py-1 text-xs font-semibold rounded-full  flex gap-2 ${
    order.isPaid
    ?" text-green-700 "
    :" text-red-700 "
  }`}>
          <CreditCard className='text-green-700' size={16}/>
          Online Payment
        </div>}
        </div>
        <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${
    order.isPaid
    ?"bg-green-100 text-green-700 border-green-300"
    :"bg-red-100 text-red-700 border-red-300"
  }`}>
          Rs. {order.totalAmount}
        </div>
        </div>
            
            <div className={`text-green-700 border-b flex items-center gap-2 border-gray-100 px-7 truncate py-4 bg-linear-to-r from-green-50 to-white ${
    order.isPaid
    ?"bg-green-100 text-green-700 border-green-300"
    :"bg-red-100 text-red-700 border-red-300"
  }`}>
    <MapPin size={18}/>
              {order.address.fullAddress}
            </div>

            <div className='border-t border-gray-200 pt-3'>
              <button
              onClick={()=>setExpended(prev=>!prev)}
              className='w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-green-700 transition'>
                <span className='flex items-center gap-2'>
                <Package size={18} className='text-green-700'/>
                  {expended?"Hide Order Item": `View ${order.items.length} Order Item`}
                </span>
                {expended?<ChevronUp/> : <ChevronDown/>}
              </button>

              <motion.div
               initial={{ opacity: 0, height:0 }}
               animate={{ height: expended? "auto" : 0,
                          opacity:expended? 1 : 0
                }}
               transition={{ duration: 0.5 }}
               className='overflow-hidden'
              >
                <div className='mt-3 space-y-3 '>
                  {order.items.map((item,index)=>(
                    <div key={index} className='flex justify-between items-center bg-amber-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition'>
                      <div className='flex items-center gap-3'>
                          <Image src={item.image} alt={item.name} width={48} height={48} className=' rounded-lg object-cover border border-gray-200'/>
                          <div>
                            <p className='text-sm font-medium text-gray-800 '>{item.name}</p>
                            <p className='text-xs text-gray-500'>{item.quantity} x {item.unit}</p>
                            {order.status === 'delivered' && item.seller && (
                              <ItemFeedback
                                orderId={order._id!.toString()}
                                groceryId={item.grocery.toString()}
                                initiallyGiven={(item as any).feedbackGiven}
                              />
                            )}
                          </div>
                      </div>
                          <div>Rs. {Number(item.price)*item.quantity}</div>
                    </div>
                  ))}
                </div>


              </motion.div>

            </div>
                <div className='border-t pt-3 flex justify-between items-center text-sm font-semibold text-gray-800'>
                  <div className={`${
    order.isPaid
    ?"bg-green-100 text-green-700 border-green-300 border-b flex items-center gap-2 border-gray-100 px-7 py-4 bg-linear-to-r from-green-50 to-white"
    :"bg-red-100 text-red-700 border-red-300 border-b flex items-center gap-2 border-gray-100 px-7 py-4 bg-linear-to-r from-red-50 to-white "
  }`}>
                    <Truck/>
                    <span>Delivery: {order.status}</span>
                  </div>
                  <div className={`${
    order.isPaid
    ?"bg-green-100 text-green-700 border-green-300 border-b flex items-center gap-2  px-7 py-4 bg-linear-to-r from-white to-green-50"
    :"bg-red-100 text-red-700 border-red-300 border-b flex items-center gap-2  px-7 py-4 bg-linear-to-r from-white to-red-50 "
  }`}>
                    Total: <span>Rs. {order.totalAmount}</span>
                  </div>

                </div>

      </div>
    </motion.div>
  )
}

export default UserOrderCard
