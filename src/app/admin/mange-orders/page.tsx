'use client'
import { IOrder } from '@/app/Models/order.model'
import AdminOrderCard from '@/components/AdminOrderCard'
import axios from 'axios'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getSocket, disconnectSocket } from '@/app/lib/socket'

function MangeOrders() {
    const [orders, setOrders]=useState<IOrder[]>()
    const router= useRouter()

    const getOrders=async ()=>{
        try {
            const result=await axios.get("/api/admin/get-orders")
            setOrders(result.data)
        } catch (error) {
            
        }
    }

    // AdminOrderCard khud delete API call kar chuka hota hai — yahan sirf
    // list se hata dena hai, dobara delete request nahi bhejni
    const handleOrderDeleted = (orderId: string) => {
        setOrders((prev) => prev?.filter((o: any) => o._id !== orderId))
    }

    // Ek dafa initial list load karo — is k baad koi polling nahi
    useEffect(()=>{
        getOrders()
    },[])

    // ─── Real-time: jab bhi koi order status change ho, ya kisi delivery
    // boy ko order assign ho, ya order deliver ho jaye — server khud is
    // page ko notify kar deta hai (pehle yahan har 5 second baad poll
    // hota tha) ──────────────────────────────────────────────────────
    useEffect(() => {
        const socket = getSocket()
        socket.connect()
        socket.emit('admin:join')
        socket.on('admin:ordersChanged', () => {
            getOrders()
        })
        return () => {
            socket.off('admin:ordersChanged')
            disconnectSocket()
        }
    }, [])
  return (
    <div className='min-h-screen bg-gray-50 w-full'>
       <div className='fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50'>
            <div className='max-w-3xl mx-auto flex items-center gap-4 px-4 py-3'>
                <button onClick={()=>router.push("/")} className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition'>
                    <ArrowLeft size={24} className='text-green-700'/>
                </button>
                <h1 className='text-xl font-bold text-gray-800 '>Mange Orders</h1>
            </div>
            </div>

            <div className='max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8'>
            <div className='space-y-6'>
                {orders?.map((orders,index)=>(
                    <AdminOrderCard order={orders} key={index} onUpdated={getOrders} onDeleted={handleOrderDeleted}/>
                ))}
            </div>
            </div>
           
    </div>
  )
}

export default MangeOrders
