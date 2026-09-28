'use client'
import { addToCart, decreaseQuantity, increaseQuantity } from '@/redux/cartSlice'
import { AppDispatch, RootState } from '@/redux/store'
import { MinusCircle, PlusCircle, ShoppingCart, Store } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { IGrocery } from './GroceryItemCard'

// /mat/<productNumber> page ka client part (image + add to cart)
function ProductDetail({ item }: { item: IGrocery }) {
  const dispatch = useDispatch<AppDispatch>()
  const { cartData } = useSelector((state: RootState) => state.cart)
  const cartItem = cartData.find((c) => c._id?.toString() === item._id?.toString())

  return (
    <div className='w-[92%] md:w-[80%] max-w-5xl mx-auto pt-28 pb-16'>
      <div className='bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden grid md:grid-cols-2'>
        <div className='relative w-full aspect-square bg-gray-50'>
          <Image src={item.image} alt={item.name} fill sizes='(max-width:768px) 100vw, 40vw' className='object-contain p-6' priority />
        </div>

        <div className='p-6 md:p-8 flex flex-col gap-3'>
          <p className='text-xs text-gray-400'>Item #{item.productNumber}</p>
          <h1 className='text-2xl md:text-3xl font-extrabold text-green-700'>{item.name}</h1>
          <p className='text-sm text-gray-500'>{item.category}</p>

          {item.seller && (
            <Link
              href={`/seller/${item.seller._id}`}
              className='flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-3 py-1 w-fit hover:bg-amber-100 transition-colors'
            >
              <Store className='w-3 h-3' />
              <span className='font-medium'>{item.seller.storeName || item.seller.name}</span>
            </Link>
          )}

          <div className='flex items-center gap-3 mt-2'>
            <span className='text-3xl font-bold text-green-700'>Rs: {item.price}</span>
            <span className='text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full'>{item.unit}</span>
          </div>

          {!cartItem ? (
            <button
              onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
              className='bg-green-600 text-white font-medium py-3 rounded-lg mt-4 flex items-center justify-center hover:bg-green-700 transition-colors gap-2'
            >
              <ShoppingCart /> Add to Cart
            </button>
          ) : (
            <div className='mt-4 text-green-600 font-medium flex items-center justify-center gap-3 bg-green-50 border border-green-200 px-4 py-3 rounded-lg'>
              <button onClick={() => dispatch(decreaseQuantity(item._id))} className='w-8 h-8 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-all'><MinusCircle size={18} /></button>
              <span className='text-gray-800 font-semibold'>{cartItem.quantity}</span>
              <button onClick={() => dispatch(increaseQuantity(item._id))} className='w-8 h-8 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-all'><PlusCircle size={18} /></button>
            </div>
          )}

          <Link href='/user/cart' className='text-center text-sm text-green-700 hover:underline mt-1'>Go to cart</Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
