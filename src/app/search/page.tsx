'use client'
import axios from 'axios'
import { ArrowLeft, Loader, SearchX, Store } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'
import GroceryItemCard from '@/components/GroceryItemCard'
import type { IGrocery } from '@/components/GroceryItemCard'

interface SellerResult {
  _id: string
  name: string
  storeName?: string
  image?: string
}

function SearchResultsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  const [products, setProducts] = useState<IGrocery[]>([])
  const [sellers, setSellers] = useState<SellerResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q.trim()) {
      setProducts([])
      setSellers([])
      setLoading(false)
      return
    }
    setLoading(true)
    axios
      .get('/api/search', { params: { q, limit: 50 } })
      .then((res) => {
        setProducts(res.data.products || [])
        setSellers(res.data.sellers || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition">
            <ArrowLeft size={24} className="text-green-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            Search results {q && <span className="text-green-700">for &quot;{q}&quot;</span>}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : products.length === 0 && sellers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500 flex flex-col items-center gap-3">
            <SearchX className="w-12 h-12 text-gray-300" />
            <p>&quot;{q}&quot; se related koi product ya seller nahi mila.</p>
          </div>
        ) : (
          <>
            {sellers.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Sellers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {sellers.map((s) => (
                    <Link
                      key={s._id}
                      href={`/seller/${s._id}`}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-4 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {s.image ? (
                          <Image src={s.image} alt={s.name} width={48} height={48} className="object-cover" />
                        ) : (
                          <Store className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate">{s.storeName || s.name}</p>
                        <p className="text-xs text-gray-400">View store profile</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {products.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((item) => (
                    <GroceryItemCard key={item._id?.toString()} item={item} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-green-600" />
        </div>
      }
    >
      <SearchResultsInner />
    </Suspense>
  )
}
