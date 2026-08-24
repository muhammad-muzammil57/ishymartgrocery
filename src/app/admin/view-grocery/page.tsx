'use client'
import axios from 'axios'
import { ArrowLeft, Boxes, Loader, Search, Store, User as UserIcon, Pencil, Trash2, X, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

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

function ViewGrocery() {
  const router = useRouter()
  const [groceries, setGroceries] = useState<IGroceryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // ─── Edit modal state ───────────────────────────────────────────
  const [editing, setEditing] = useState<IGroceryRow | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editUnit, setEditUnit] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editPreview, setEditPreview] = useState<string | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  // ─── Delete confirm state ───────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<IGroceryRow | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  useEffect(() => {
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

  // ─── Open edit modal, pre-fill with current values ──────────────
  const openEdit = (g: IGroceryRow) => {
    setEditing(g)
    setEditName(g.name)
    setEditCategory(g.category)
    setEditUnit(g.unit)
    setEditPrice(g.price)
    setEditPreview(g.image || null)
    setEditImageFile(null)
    setEditError('')
  }

  const closeEdit = () => {
    setEditing(null)
    setEditError('')
  }

  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setEditImageFile(file)
    setEditPreview(URL.createObjectURL(file))
  }

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    setEditError('')
    try {
      const formData = new FormData()
      formData.append('name', editName)
      formData.append('category', editCategory)
      formData.append('unit', editUnit)
      formData.append('price', editPrice)
      if (editImageFile) formData.append('image', editImageFile)

      const res = await axios.patch(`/api/admin/grocery/${editing._id}`, formData)

      // List mein turant update kar do (refetch ki zaroorat nahi)
      setGroceries((prev) => prev.map((g) => (g._id === editing._id ? res.data : g)))
      closeEdit()
    } catch (err: any) {
      setEditError(err?.response?.data?.message || 'Update fail ho gaya. Dobara try karein.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await axios.delete(`/api/admin/grocery/${deleteTarget._id}`)
      setGroceries((prev) => prev.filter((g) => g._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
      alert('Delete fail ho gaya. Dobara try karein.')
    } finally {
      setDeleting(false)
    }
  }

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

                  {/* ─── Admin actions: Edit / Delete ─── */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => openEdit(g)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg py-2 hover:bg-blue-100 transition"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(g)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg py-2 hover:bg-red-100 transition"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── EDIT MODAL ─── */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={closeEdit}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Pencil className="text-green-600 w-5 h-5" /> Edit Grocery Item
                </h2>
                <button onClick={closeEdit} className="p-1.5 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1.5 text-sm">Grocery Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1.5 text-sm">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {categories.map((cat) => (
                        <option value={cat} key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1.5 text-sm">Unit</label>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {units.map((u) => (
                        <option value={u} key={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1.5 text-sm">Price</label>
                  <input
                    type="text"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="cursor-pointer flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold border border-green-200 rounded-xl px-5 py-2.5 hover:bg-green-100 transition-all text-sm">
                    <Upload size={16} /> Change Image
                    <input type="file" accept="image/*" hidden onChange={handleEditImageChange} />
                  </label>
                  {editPreview && (
                    <Image src={editPreview} alt="Preview" width={64} height={64} className="rounded-lg object-cover border" />
                  )}
                </div>

                {editError && (
                  <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg p-2">{editError}</p>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── DELETE CONFIRM MODAL ─── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4"
            >
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Grocery Item Delete Karein?</h3>
                <p className="text-gray-500 text-sm mt-1">
                  &quot;{deleteTarget.name}&quot; hamesha ke liye delete ho jayega. Yeh action wapis nahi ho sakta.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ViewGrocery
