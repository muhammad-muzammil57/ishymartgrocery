'use client'
import axios from 'axios'
import { ArrowLeft, Boxes, Loader, Search, Store, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'

interface IGroceryRow {
  _id: string
  name: string
  price: string
  unit: string
  image: string
  category: string
  seller: { _id: string; name: string; storeName?: string; image?: string } | null
  createdAt: string
}

function ViewGrocery() {
  const router = useRouter()
  const [groceries, setGroceries] = useState<IGroceryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/admin/get-groceries')
        setGroceries(res.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groceries
    return groceries.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        (g.seller?.storeName || g.seller?.name || '').toLowerCase().includes(q)
    )
  }, [groceries, search])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition"
          >
            <ArrowLeft size={24} className="text-green-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Boxes className="text-green-700" size={22} /> View Grocery
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <p className="text-sm text-gray-500">
            Total <span className="font-bold text-green-700">{groceries.length}</span> grocery item(s) —
            IshyMart (admin) aur sab sellers dono ki milaa kar
          </p>
          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, seller..."
              className="w-full outline-none text-sm text-gray-700"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
            Koi grocery item nahi mila.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g, index) => (
              <motion.div
                key={g._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.4) }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="relative w-full h-36 bg-gray-50">
                  {g.image ? (
                    <Image src={g.image} alt={g.name} fill className="object-contain p-3" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Boxes size={36} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-bold text-gray-800 truncate">{g.name}</p>
                  <p className="text-xs text-gray-500">{g.category}</p>
                  <p className="text-green-700 font-semibold text-sm mt-1">
                    Rs {g.price} / {g.unit}
                  </p>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {g.seller ? (
                      <Link
                        href={`/seller/${g.seller._id}`}
                        className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 w-fit hover:bg-amber-100 transition"
                      >
                        <Store size={13} />
                        Isny lagai hai:{' '}
                        <span className="font-semibold">
                          {g.seller.storeName || g.seller.name}
                        </span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 w-fit">
                        <UserIcon size={13} />
                        Isny lagai hai: <span className="font-semibold">Admin (IshyMart)</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewGrocery
