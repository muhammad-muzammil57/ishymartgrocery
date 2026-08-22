// src/app/return-policy/page.tsx
import React from 'react'
import Link from 'next/link'
import { RefreshCw, ChevronRight, CheckCircle, XCircle, Clock, PackageX } from 'lucide-react'

const eligibleItems = [
  'Sealed packaged goods that are damaged upon delivery',
  'Products with expired or near-expiry dates delivered in error',
  'Incorrect items delivered (wrong product, wrong brand, wrong size)',
  'Visibly contaminated or tampered products',
  'Items with missing components or accessories as listed',
]

const nonEligibleItems = [
  'Fresh fruits and vegetables (perishable)',
  'Frozen items confirmed to be in good condition at delivery',
  'Items damaged after delivery due to customer handling',
  'Products where the seal was broken by the customer',
  'Items reported more than 24 hours after delivery',
  'Promotional or free items included with an order',
]

const steps = [
  {
    icon: '📸',
    title: 'Document the Issue',
    desc: 'Take clear photos of the damaged, incorrect, or expired product immediately upon discovery.',
  },
  {
    icon: '📩',
    title: 'Contact Support Within 24 Hours',
    desc: 'Reach out via our in-app support chat or email support@ishymart.com with your order number and photos.',
  },
  {
    icon: '✅',
    title: 'Claim Review',
    desc: 'Our team reviews your claim within 1 business day. You will receive a confirmation of approval or denial.',
  },
  {
    icon: '💳',
    title: 'Refund Processing',
    desc: 'Approved refunds are processed within 3–5 business days to your original payment method.',
  },
]

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-green-50/30">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-5">
            <RefreshCw className="w-7 h-7 text-green-200" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Return & Refund Policy</h1>
          <p className="text-green-200 text-sm">Last updated: June 2025 &nbsp;·&nbsp; Effective immediately</p>
          <p className="text-green-100 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            We stand behind the quality of every product we deliver. If something is not right, we make it right — quickly and fairly.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-green-700 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">Return Policy</span>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-8">

        {/* Time limit banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <Clock className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 text-sm">24-Hour Reporting Window</p>
            <p className="text-amber-700 text-sm mt-1">
              All return or refund claims must be submitted within <strong>24 hours</strong> of receiving your delivery. Claims submitted after this window may not be eligible for a refund.
            </p>
          </div>
        </div>

        {/* Eligible & Not Eligible */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="font-bold text-gray-800">Eligible for Return / Refund</h2>
            </div>
            <ul className="space-y-2">
              {eligibleItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-gray-800">Not Eligible for Return</h2>
            </div>
            <ul className="space-y-2">
              {nonEligibleItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How to Claim */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-6">How to Submit a Return Claim</h2>
          <div className="space-y-5">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg shrink-0">
                  {step.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{step.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Timelines */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">Refund Timelines</h2>
          <div className="space-y-3">
            {[
              { method: 'Credit / Debit Card', timeline: '3–5 business days' },
              { method: 'Bank Transfer / Wallet', timeline: '2–4 business days' },
              { method: 'Cash on Delivery Orders', timeline: 'Store credit issued within 24 hours' },
            ].map((row) => (
              <div key={row.method} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700 font-medium">{row.method}</span>
                <span className="text-sm text-green-700 font-semibold bg-green-50 px-3 py-1 rounded-full">{row.timeline}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Refund timelines are subject to your bank's or payment provider's processing times, which are outside IshyMart's control.</p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-2xl p-6 text-white text-center">
          <PackageX className="w-8 h-8 text-green-300 mx-auto mb-3" />
          <p className="font-bold text-lg mb-1">Need to Report an Issue?</p>
          <p className="text-green-200 text-sm mb-4">Contact our support team within 24 hours of your delivery.</p>
          <a
            href="mailto:support@ishymart.com"
            className="inline-block bg-white text-green-800 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-green-50 transition-all"
          >
            support@ishymart.com
          </a>
        </div>
      </div>
    </main>
  )
}