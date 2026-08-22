'use client'
import { IOrder } from '@/app/Models/order.model'
import axios from 'axios'
import { ArrowLeft, PackageCheckIcon, PackageSearch } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {motion} from "motion/react"
import UserOrderCard from '@/components/UserOrderCard'

function MyOrder() {
    const [orders, setOrders]=useState<IOrder[]>()
    const [loading, setLoading]=useState(true)
    const router=useRouter()
    useEffect(()=>{
        const getMyOrders=async ()=>{
            try {
                const result=await axios.get("/api/user/my-order")
                console.log(result.data)
                 setOrders(result.data)
                 setLoading(false)
            } catch (error) {
                console.log(error)
            }
        }
        getMyOrders()
    },[])



    if(loading){
        return <div className='text-green-700 font-bold text-center flex items-center justify-center min-h-[50vh]'>Loading Your Orders...</div>
    }
  return (
    <div className='bg-linear-to-b from-white to-gray-100 min-h-screen w-full'>
        <div className='max-w-3xl mx-auto px-4 pt-16 pb-10 relative'>
            <div className='fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50'>
            <div className='max-w-3xl mx-auto flex items-center gap-4 px-4 py-3'>
                <button onClick={()=>router.push("/")} className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition'>
                    <ArrowLeft size={24} className='text-green-700'/>
                </button>
                <h1 className='text-xl font-bold text-gray-800 '>My Orders</h1>
            </div>
            </div>

            {orders?.length==0 ? (
                <div className='pt-20 flex flex-col items-center text-center'>
                    <PackageSearch size={70} className='text-green-700 mb-4'/>
                    <h2 className='text-xl font-bold text-gray-700 '>No Orders Found </h2>
                    <p className='text-gray-500 text-sm mt-1'>Start Shopping to view your orders here...</p>
                    <Link
            href={"/"}
            className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg mt-4 flex items-center justify-center hover:bg-green-700 transition-colors"
          >
            Shop Now
          </Link>
                </div>
            ) : <div className='mt-4 space-y-6'>
                {orders?.map((order, index)=>(
                    <motion.div
                    key={index }
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    >
                        <UserOrderCard order={order}/>
                    </motion.div>
                ))}
                </div>}

        </div>
      
    </div>
  )
}

export default MyOrder
