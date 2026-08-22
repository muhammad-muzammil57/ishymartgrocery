'use client'
import { ArrowLeft, FileCheck2, Loader, Store, Upload } from 'lucide-react'
import Link from 'next/link'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

function DocInput({
  label,
  hint,
  file,
  onChange,
}: {
  label: string
  hint: string
  file: File | null
  onChange: (f: File | null) => void
}) {
  return (
    <div className="border border-green-200 rounded-xl p-4 bg-green-50/40">
      <label className="block text-gray-700 font-semibold mb-1">
        {label} <span className="text-red-600">*</span>
      </label>
      <p className="text-xs text-gray-500 mb-3">{hint}</p>
      <label className="cursor-pointer inline-flex items-center gap-2 bg-white text-green-700 font-semibold border border-green-200 rounded-xl px-4 py-2 hover:bg-green-100 transition-all">
        <Upload className="w-4 h-4" /> {file ? "Change File" : "Choose File"}
        <input
          type="file"
          accept="image/*,application/pdf"
          hidden
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {file && (
        <span className="ml-3 inline-flex items-center gap-1 text-sm text-green-700">
          <FileCheck2 className="w-4 h-4" /> {file.name}
        </span>
      )}
    </div>
  )
}

function SellerApplyPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [bankDocument, setBankDocument] = useState<File | null>(null)
  const [utilityBill, setUtilityBill] = useState<File | null>(null)
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    axios
      .get('/api/seller/status')
      .then((res) => {
        const status = res.data.sellerStatus
        if (status === 'pending' || status === 'suspended') {
          router.replace('/seller/pending')
        } else if (status === 'approved') {
          router.replace('/seller/dashboard')
        }
      })
      .finally(() => setCheckingStatus(false))
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName || !storeName || !phone || !address || !bankDocument || !utilityBill || !idDocument) {
      setError('Please fill all fields and upload all required documents.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('fullName', fullName)
      formData.append('storeName', storeName)
      formData.append('phone', phone)
      formData.append('address', address)
      formData.append('bankDocument', bankDocument)
      formData.append('utilityBill', utilityBill)
      formData.append('idDocument', idDocument)

      await axios.post('/api/seller/apply', formData)
      router.push('/seller/pending')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong, please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white py-24 px-4 relative">
      <Link
        href="/"
        className="text-green-700 absolute top-6 left-6 flex items-center gap-2 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-green-100 hover:shadow-lg transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden md:flex">Back to Home</span>
      </Link>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white w-full max-w-2xl shadow-2xl rounded-3xl border border-green-100 p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3">
            <Store className="text-green-600 w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-green-700 text-center">Become a Seller</h1>
          </div>
          <p className="text-gray-500 text-sm mt-2 text-center max-w-md">
            Fill in your details and upload your verification documents. Our team reviews new
            seller applications within 3–4 days.
          </p>
        </div>

        <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Your full legal name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Shop / Store Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Asad's Fresh Store"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="03xx-xxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Address <span className="text-red-600">*</span>
            </label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Your full business/home address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <DocInput
              label="Bank Document"
              hint="Bank statement, IBAN certificate, or account maintenance letter"
              file={bankDocument}
              onChange={setBankDocument}
            />
            <DocInput
              label="Electricity Bill"
              hint="A recent electricity (WAPDA/utility) bill for your address"
              file={utilityBill}
              onChange={setUtilityBill}
            />
            <DocInput
              label="Identity Verification"
              hint="Any one: CNIC, Passport, or Driving License"
              file={idDocument}
              onChange={setIdDocument}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Submit Application'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default SellerApplyPage
