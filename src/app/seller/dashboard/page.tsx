'use client'
import { Loader, PlusCircle, Trash2, Upload } from 'lucide-react'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Rice, Atta & Pulses",
  "Snacks & Biscuits",
  "Beverages & Drinks",
  "Personal Care & Hygiene",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet Care",
  "Spices & Masalas",
]

const units = ["kg", "gram", "litter", "ml", "pack", "piece"]

function SellerDashboardPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [unit, setUnit] = useState('')
  const [price, setPrice] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const res = await axios.get('/api/seller/products')
      setProducts(res.data)
    } catch {
      // ignore
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    axios
      .get('/api/seller/status')
      .then((res) => {
        if (res.data.sellerStatus !== 'approved') {
          router.replace(res.data.sellerStatus === 'pending' || res.data.sellerStatus === 'suspended' ? '/seller/pending' : '/seller/apply')
        } else {
          fetchProducts()
        }
      })
      .finally(() => setChecking(false))
  }, [router])

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !category || !unit || !price) {
      setError('Please fill all fields.')
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('category', category)
      formData.append('unit', unit)
      formData.append('price', price)
      if (image) formData.append('image', image)

      await axios.post('/api/seller/products', formData)
      setName('')
      setCategory('')
      setUnit('')
      setPrice('')
      setImage(null)
      setPreview(null)
      fetchProducts()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await axios.delete(`/api/seller/products/${id}`)
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch {
      alert('Failed to delete product')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-white py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-2xl rounded-3xl border border-green-100 p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <PlusCircle className="text-green-600 w-7 h-7" />
            <h1 className="text-2xl font-extrabold text-green-700">Add New Product</h1>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Product Name *</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Category *</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Unit *</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="">Select unit</option>
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Price *</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
              <label className="cursor-pointer flex items-center gap-2 bg-green-50 text-green-700 font-semibold border border-green-200 rounded-xl px-6 py-3 hover:bg-green-100 transition-all w-full sm:w-auto">
                <Upload /> Upload Image
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </label>
              {preview && <Image src={preview} alt="preview" width={100} height={100} className="rounded-lg object-cover" />}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
              disabled={submitting}
            >
              {submitting ? <Loader className="w-5 h-5 animate-spin" /> : 'Add Product'}
            </button>
          </form>
        </motion.div>

        <div className="bg-white shadow-2xl rounded-3xl border border-green-100 p-8">
          <h2 className="text-xl font-extrabold text-green-700 mb-6">My Products ({products.length})</h2>
          {loadingProducts ? (
            <Loader className="w-6 h-6 animate-spin text-green-600" />
          ) : products.length === 0 ? (
            <p className="text-gray-500">You haven't added any products yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p._id} className="border border-gray-100 rounded-2xl p-4 shadow-sm relative">
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="absolute top-3 right-3 bg-red-50 text-red-600 rounded-full p-2 hover:bg-red-100"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {p.image && (
                    <div className="relative w-full aspect-square mb-3">
                      <Image src={p.image} alt={p.name} fill className="object-contain" />
                    </div>
                  )}
                  <h3 className="font-bold text-green-700">{p.name}</h3>
                  <p className="text-xs text-gray-500">{p.category}</p>
                  <p className="text-green-700 font-semibold mt-1">Rs {p.price} / {p.unit}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerDashboardPage
