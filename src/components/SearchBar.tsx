'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, Store, Boxes, Loader2 } from 'lucide-react'

interface ProductResult {
  _id: string
  name: string
  price: string
  unit: string
  image: string
  category: string
}

interface SellerResult {
  _id: string
  name: string
  storeName?: string
  image?: string
}

// Navbar ka search bar — pehle sirf ek "dead" input tha (kuch hota hi
// nahi tha). Ab type karte hi (debounced) matching products aur sellers
// ka dropdown aata hai; Enter ya search-icon dabane par poore results
// wala page (/search?q=...) khulta hai.
function SearchBar({
  autoFocus,
  onNavigate,
  variant = 'desktop',
}: {
  autoFocus?: boolean
  onNavigate?: () => void
  variant?: 'desktop' | 'mobile'
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<ProductResult[]>([])
  const [sellers, setSellers] = useState<SellerResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = query.trim()
    if (!q) {
      setProducts([])
      setSellers([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get('/api/search', { params: { q, limit: 5 } })
        setProducts(res.data.products || [])
        setSellers(res.data.sellers || [])
        setOpen(true)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const goToFullResults = () => {
    const q = query.trim()
    if (!q) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(q)}`)
    onNavigate?.()
  }

  const goToSeller = (id: string) => {
    setOpen(false)
    router.push(`/seller/${id}`)
    onNavigate?.()
  }

  const hasResults = products.length > 0 || sellers.length > 0

  return (
    <div ref={wrapRef} className={variant === 'desktop' ? 'relative w-full' : 'relative grow'}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          goToFullResults()
        }}
        className={
          variant === 'desktop'
            ? 'flex items-center bg-white rounded-full px-4 py-3 w-full shadow-md'
            : 'flex items-center w-full'
        }
      >
        <Search className="text-gray-500 w-5 h-5 mr-2 ml-2 shrink-0" />
        <input
          type="text"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search which you need...?"
          className="w-full outline-none text-gray-700 placeholder:text-gray-400 bg-transparent"
        />
        {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />}
      </form>

      {open && query.trim() && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
          {!hasResults && !loading && (
            <p className="text-gray-400 text-sm text-center py-6">Koi result nahi mila</p>
          )}

          {products.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Products</p>
              {products.map((p) => (
                <button
                  key={p._id}
                  onClick={goToFullResults}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-green-50 text-left transition-colors"
                >
                  <div className="relative w-10 h-10 rounded-lg bg-gray-50 shrink-0 overflow-hidden">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill className="object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Boxes size={16} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category} · Rs {p.price}/{p.unit}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {sellers.length > 0 && (
            <div className="py-2 border-t border-gray-100">
              <p className="px-4 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Sellers</p>
              {sellers.map((s) => (
                <button
                  key={s._id}
                  onClick={() => goToSeller(s._id)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-amber-50 text-left transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {s.image ? (
                      <Image src={s.image} alt={s.name} width={36} height={36} className="object-cover" />
                    ) : (
                      <Store className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{s.storeName || s.name}</p>
                </button>
              ))}
            </div>
          )}

          {hasResults && (
            <button
              onClick={goToFullResults}
              className="w-full text-center text-xs font-semibold text-green-700 py-2.5 border-t border-gray-100 hover:bg-green-50"
            >
              Sab results dekhein →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
