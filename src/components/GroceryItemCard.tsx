'use client'
import { addToCart, decreaseQuantity, increaseQuantity } from '@/redux/cartSlice'
import { AppDispatch, RootState } from '@/redux/store'
import { MinusCircle, PlusCircle, ShoppingCart, Star, Store } from 'lucide-react'
import mongoose from 'mongoose'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
export interface IGrocery{
    _id:mongoose.Types.ObjectId,
    name:string,
    price:string,
    unit:string,
    image:string,
    category:string,
    seller?: {
      _id: mongoose.Types.ObjectId
      name: string
      storeName?: string
      image?: string
    } | null,

    createdAt?:Date,
    updatedAt?:Date

}

function GroceryItemCard({item, sellerRating}:{item:IGrocery, sellerRating?: { avgRating: number; count: number }}) {
    
    const dispatch = useDispatch<AppDispatch>()

    const {cartData}=useSelector((state:RootState)=>state.cart)
    const cartItem = cartData.find(cartItem => cartItem._id?.toString() === item._id?.toString())

  return (
    <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: false, amount: 0.5 }}
    className='bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col'
    >
      <div className='relative w-full aspect-[4/3] bg-gray-50 overflow-hidden group'>
        <Image src={item.image} alt={item.name} fill sizes='(max-width:768px) 100vw, 25vw' className='object-contain p-4 transition-transform duration-500 group-hover:scale-105'/>
        <div className='absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300'/>
      </div>

      <div className='p-4 flex-1 flex flex-col justify-between'>
      <h3 className='text-xl text-green-700 font-extrabold text-center mb-1'>⚘{item.name}⚘</h3>
      <p className='text-xs text-gray-500 font-medium mb-1 text-center'>{item.category}</p>

      {/* Marketplace seller ka product ho to seller name + rating dikhao,
          taake buyer ko pata rahe kon sell kar raha hai */}
      {item.seller && (
        <Link
          href={`/seller/${item.seller._id}`}
          className='flex items-center justify-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-1 mt-1 mx-auto hover:bg-amber-100 transition-colors'
        >
          <Store className='w-3 h-3' />
          <span className='font-medium'>{item.seller.storeName || item.seller.name}</span>
          {sellerRating && sellerRating.count > 0 && (
            <span className='flex items-center gap-0.5 text-amber-600'>
              <Star className='w-3 h-3 fill-amber-400 text-amber-400' />
              {sellerRating.avgRating.toFixed(1)}
            </span>
          )}
        </Link>
      )}

      <div className='flex items-center justify-between mt-2'>
        <span className='text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full'>{item.unit}</span>
        <span className='text-green-700 font-bold text-lg'> <span>Rs:</span>
          {item.price} 
        </span>
      </div>

      {!cartItem ?

      <motion.button 
      onClick={()=>dispatch(addToCart({...item,quantity:1}))}
      whileTap={{scale:0.95}}
      className='bg-green-600 text-white font-medium py-2 rounded-lg mt-4 flex items-center justify-center hover:bg-green-700 transition-colors gap-2'>
        <ShoppingCart /> Add to Cart
      </motion.button> 
      : <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='mt-4 text-green-600 font-medium flex items-center justify-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg'>
       <button onClick={()=>dispatch(decreaseQuantity(item._id))} className='w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-all'><MinusCircle size={16}/></button>
       <span className='text-gray-800 text-sm font-semibold'>{cartItem.quantity}</span>
       <button onClick={()=>dispatch(increaseQuantity(item._id))} className='w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-all'><PlusCircle size={16}/></button>
      
        
        </motion.div>}

      </div>

    </motion.div>
  )
}

export default GroceryItemCard
