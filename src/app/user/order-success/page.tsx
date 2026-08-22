'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useEffect, useState } from 'react'
import useGetMe from '@/hooks/useGetMe'
import { useRouter } from 'next/navigation'
import { motion  } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type UserData = {
  name?: string
  email?: string
  mobile?: string
  image?: string
  role?: string
}


export default function OrderSuccessPage() {

  const router=useRouter()

  const { cartData, finalTotal } = useSelector((state: RootState) => state.cart)
  const userData = useGetMe() as UserData | null

  const [address, setAddress] = useState({
    fullName: '',
    mobile: '',
    city: '',
    state: '',
    postalCode: '',
    fullAddress: '',
  })

  // Autofill - userData aane par chalega
  useEffect(() => {
    if (userData && (userData.name || userData.mobile)) {
      setAddress((prev) => ({
        ...prev,
        fullName: userData.name || '',
        mobile: userData.mobile || '',
      }))
    }
  }, [userData])

  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  const totalQuantity = cartData.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <div className="min-h-screen bg-[#07110b] relative overflow-hidden flex items-center justify-center px-4 py-14">



      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        

        <div className="absolute -top-40 -left-40 w-[500px] h-auto bg-emerald-500/10 blur-[140px] pt-6 rounded-full" />

        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-yellow-500/10 blur-[140px] rounded-full" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-yellow-400/5 blur-[180px] rounded-full" />

        {/* floating particles */}
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            <div className="w-[3px] h-[3px] rounded-full bg-[#d4af37]/50" />
          </div>
        ))}
      </div>

      {/* MAIN CARD */}
      <motion.button
        onClick={() => router.push('/user/checkout')}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileTap={{ scale: 0.95 }}
        className='absolute left-6 items-center flex top-4 gap-2 text-green-700 hover:text-green-800 font-medium transition-colors cursor-pointer'
      >
        <ArrowLeft size={20} />
        <span className='hidden sm:inline'>Back To Cart</span>
      </motion.button>
      <div
        className={`relative z-10 w-full max-w-2xl transition-all duration-1000 ${
          show
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="relative overflow-visible rounded-[36px] border border-[#d4af37]/20 bg-white/[0.03] backdrop-blur-2xl shadow-[0_0_80px_rgba(212,175,55,0.08)]">

          {/* top premium glow line */}
          <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

          {/* INNER CONTENT */}
          <div className="px-8 md:px-12 py-14">

            {/* SUCCESS ICON */}
            <div className="flex justify-center mb-10">

              <div className="relative">

                {/* outer ring */}
                <div className="absolute inset-0 scale-[1.7] rounded-full border border-emerald-400/20 animate-ping" />

                <div className="absolute inset-0 scale-[2.2] rounded-full border border-[#d4af37]/10 animate-ping [animation-duration:3s]" />

                {/* main circle */}
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] border border-white/10">

                  {/* glossy effect */}
                  <div className="absolute top-2 left-3 right-3 h-10 bg-white/20 blur-xl rounded-full" />

                  {/* tick */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-12 h-12 relative z-10"
                    fill="none"
                    stroke="green"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeDasharray="30"
                      strokeDashoffset={show ? 0 : 30}
                      style={{
                        transition:
                          'stroke-dashoffset 0.8s ease 0.4s',
                      }}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* TITLE */}
            <div className="text-center">

              <p className="uppercase tracking-[0.4em] text-[#d4af37]/70 text-[11px] mb-3 font-medium">
                ORDER SUCCESSFULLY PLACED
              </p>

              <h1 className="text-4xl md:text-5xl font-bold text-green-700 leading-tight">

                Shukriya{' '}

                <span className="text-green-700 bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f8e08c] to-[#d4af37]">
                  {userData?.name}
                </span>

              </h1>

              <p className="text-white/60 mt-4 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
                Thank you for your purchasing! Your Order has been placed and is being processod  ✨
              </p>
            </div>

            {/* PREMIUM DIVIDER */}
            <div className="flex items-center gap-4 my-10">

              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4af37]/30" />

              <div className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_12px_#d4af37]" />

              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4af37]/30" />
            </div>

            {/* ORDER SUMMARY */}
            <div className="space-y-4">

              <div className="flex items-center justify-between mb-5">

                <p className="text-[#d4af37]/70 uppercase tracking-[0.3em] text-xs">
                  Order Summary
                </p>

                <p className="text-white/40 text-xs">
                  {totalQuantity} Items
                </p>
              </div>

              {cartData.length > 0 ? (
                cartData.map((item, index) => (
                  <div
                    key={item._id?.toString() || index}
                    className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] hover:border-[#d4af37]/20 transition-all duration-500"
                  >

                    {/* hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-[#d4af37]/5 via-transparent to-emerald-500/5" />

                    <div className="relative flex items-center justify-between px-5 py-4">

                      <div className="flex items-center gap-4">

                        {/* qty */}
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                          {item.quantity}x
                        </div>

                        {/* details */}
                        <div>
                          <p className="text-white font-medium text-sm md:text-base">
                            {item.name}
                          </p>

                          <p className="text-white/40 text-xs mt-1">
                            {item.unit}
                          </p>
                        </div>
                      </div>

                      {/* price */}
                      <div className="text-right">

                        <p className="text-[#d4af37] font-bold text-sm md:text-base">
                          Rs.{' '}
                          {(
                            Number(item.price) * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl text-white/40">
                  Cart empty hai
                </div>
              )}
            </div>

            {/* TOTAL BOX */}
            <div className="mt-10 rounded-3xl border border-[#d4af37]/15 bg-gradient-to-br from-[#d4af37]/10 to-transparent p-6 relative overflow-hidden">

              {/* glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4af37]/10 blur-[80px]" />

              <div className="relative space-y-4">

                <div className="flex justify-between text-sm">
                  <span className="text-white/50">
                    Customer
                  </span>

                  <span className="text-emerald-400">
                    {userData?.name || '—'}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-white/50">
                    Total Items
                  </span>

                  <span className="text-green-700">
                    {totalQuantity}
                  </span>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex justify-between items-center">

                  <span className="text-white text-lg font-semibold">
                    Grand Total
                  </span>

                  <span className="text-3xl font-black text-green-700 bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#ffe58f]">
                    Rs. {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-10 text-center">

              <p className="text-white/30 text-sm tracking-wide">
                Delivery updates aapko SMS aur WhatsApp par milti rahengi 🚚
              </p>

              <p className="text-[#d4af37]/50 text-xs mt-4 tracking-[0.25em] uppercase">
                Thank You For Shopping With Us
              </p>

              <Link
            href={"/user/my-order"}
            className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg mt-4 flex items-center justify-center hover:bg-green-700 transition-colors"
          >
            Go to My Orders
          </Link>

            </div>
          </div>

          {/* bottom premium line */}
          <div className="absolute bottom-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
        </div>
      </div>

      {/* GLOBAL ANIMATION */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
            opacity: 0.2;
          }

          50% {
            transform: translateY(-15px);
            opacity: 0.7;
          }

          100% {
            transform: translateY(0px);
            opacity: 0.2;
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}