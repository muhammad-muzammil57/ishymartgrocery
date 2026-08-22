'use client'
import axios from 'axios'
import { ArrowLeft, Loader, Star, Store, User as UserIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'

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

function SellerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    axios
      .get(`/api/seller/profile/${id}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Seller not found</div>
  }

  const { seller, products, feedbacks, avgRating, totalReviews } = data

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-white py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-green-700 flex items-center gap-2 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-green-100 transition-all mb-6 w-fit"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6"
        >
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center flex-shrink-0">
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
            <p className="text-xs text-gray-400 mt-2">Selling on IshyMart since {new Date(seller.createdAt).toLocaleDateString()}</p>
          </div>
        </motion.div>

        <div className="bg-white rounded-3xl shadow p-6 mb-8">
          <h2 className="font-bold text-gray-800 mb-4">Products ({products.length})</h2>
          {products.length === 0 ? (
            <p className="text-gray-500 text-sm">No products listed yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((p: any) => (
                <div key={p._id} className="border border-gray-100 rounded-2xl p-3">
                  {p.image && (
                    <div className="relative w-full aspect-square mb-2">
                      <Image src={p.image} alt={p.name} fill className="object-contain" />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-green-700 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">Rs {p.price} / {p.unit}</p>
                </div>
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
              {feedbacks.map((f: any) => (
                <div key={f._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
                      {f.buyer?.image ? <Image src={f.buyer.image} alt={f.buyer.name} fill className="object-cover" /> : <UserIcon className="w-4 h-4 text-green-600" />}
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
    </div>
  )
}

export default SellerProfilePage
