'use client'
import { Star, Store, User as UserIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import GroceryItemCard from './GroceryItemCard'
import type { IGrocery } from './GroceryItemCard'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

interface StoreProfileProps {
  seller: { name: string; storeName?: string; image?: string }
  sinceLabel: string
  products: IGrocery[]
  feedbacks: { _id: string; rating: number; comment?: string; buyer?: { name?: string; image?: string } }[]
  avgRating: number
  totalReviews: number
}

// /imu/<storeSlug> page ka client part — store info, products aur reviews
function StoreProfile({ seller, sinceLabel, products, feedbacks, avgRating, totalReviews }: StoreProfileProps) {
  return (
    <div className="w-[92%] md:w-[80%] max-w-6xl mx-auto pt-28 pb-16">
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center shrink-0">
          {seller.image ? <Image src={seller.image} alt={seller.name} fill className="object-cover" /> : <Store className="w-10 h-10 text-green-600" />}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-green-700">{seller.storeName || seller.name}</h1>
          <p className="text-gray-500 text-sm">by {seller.name}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
            <Stars rating={avgRating} />
            <span className="text-sm text-gray-600">
              {avgRating.toFixed(1)} ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Selling on IshyMart since {sinceLabel}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-green-700 mb-4">Products ({products.length})</h2>
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl shadow p-6 text-gray-500 text-sm">No products listed yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <GroceryItemCard key={item._id?.toString()} item={item} />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow p-6">
        <h2 className="font-bold text-gray-800 mb-4">Reviews</h2>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {feedbacks.map((f) => (
              <div key={f._id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
                    {f.buyer?.image ? <Image src={f.buyer.image} alt={f.buyer.name || 'Buyer'} fill className="object-cover" /> : <UserIcon className="w-4 h-4 text-green-600" />}
                  </div>
                  <span className="font-semibold text-sm text-gray-800">{f.buyer?.name}</span>
                  <Stars rating={f.rating} />
                </div>
                {f.comment && <p className="text-sm text-gray-600 ml-10">{f.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreProfile
