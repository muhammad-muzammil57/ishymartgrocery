"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { Store, PackagePlus, Wallet, ClipboardList, Hourglass } from "lucide-react"

type SellerStatus = "none" | "pending" | "approved" | "rejected" | "suspended"

function SellerSubNav() {
  const [status, setStatus] = useState<SellerStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch("/api/seller/status")
      .then((res) => res.json())
      .then((data) => {
        if (active) setStatus(data.sellerStatus ?? "none")
      })
      .catch(() => active && setStatus("none"))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading) return null

  return (
    <div className="w-[95%] fixed top-24 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 rounded-2xl shadow-md flex items-center gap-2 h-12 px-4 md:px-8 z-40 overflow-x-auto no-scrollbar">
      {(status === "none" || status === "rejected") && (
        <Link
          href="/seller/apply"
          className="flex items-center gap-1.5 text-amber-800 font-semibold text-sm whitespace-nowrap hover:text-amber-900 transition-colors"
        >
          <Store className="w-4 h-4" /> Sell on IshyMart
        </Link>
      )}

      {status === "pending" && (
        <Link
          href="/seller/pending"
          className="flex items-center gap-1.5 text-amber-800 font-semibold text-sm whitespace-nowrap hover:text-amber-900 transition-colors"
        >
          <Hourglass className="w-4 h-4" /> Seller Application Pending
        </Link>
      )}

      {status === "suspended" && (
        <Link
          href="/seller/pending"
          className="flex items-center gap-1.5 text-red-700 font-semibold text-sm whitespace-nowrap hover:text-red-800 transition-colors"
        >
          <Hourglass className="w-4 h-4" /> Seller Account Suspended
        </Link>
      )}

      {status === "approved" && (
        <>
          <span className="text-amber-700 font-bold text-sm whitespace-nowrap flex items-center gap-1.5">
            <Store className="w-4 h-4" /> Selling Account
          </span>
          <span className="text-amber-300">|</span>
          <Link
            href="/seller/dashboard"
            className="flex items-center gap-1.5 text-amber-800 font-medium text-sm whitespace-nowrap hover:text-amber-900 transition-colors"
          >
            <PackagePlus className="w-4 h-4" /> My Products
          </Link>
          <Link
            href="/seller/orders"
            className="flex items-center gap-1.5 text-amber-800 font-medium text-sm whitespace-nowrap hover:text-amber-900 transition-colors"
          >
            <ClipboardList className="w-4 h-4" /> My Orders
          </Link>
          <Link
            href="/seller/withdrawals"
            className="flex items-center gap-1.5 text-amber-800 font-medium text-sm whitespace-nowrap hover:text-amber-900 transition-colors"
          >
            <Wallet className="w-4 h-4" /> Earnings & Withdraw
          </Link>
        </>
      )}
    </div>
  )
}

export default SellerSubNav
