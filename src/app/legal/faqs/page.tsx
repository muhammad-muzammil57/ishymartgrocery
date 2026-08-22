'use client'
// src/app/faqs/page.tsx
import React, { useState } from 'react'
import Link from 'next/link'
import { HelpCircle, ChevronRight, ChevronDown, Search } from 'lucide-react'

const faqs = [
  {
    category: 'Orders & Delivery',
    icon: '🛒',
    items: [
      {
        q: 'How fast does IshyMart deliver?',
        a: 'We target a 10-minute delivery window across our core Lahore zones. Actual delivery time may vary based on your location, current order volume, traffic, and weather conditions. You can track your order live in the app.',
      },
      {
        q: 'Which areas of Lahore does IshyMart deliver to?',
        a: 'We currently serve DHA Phases 1–8, Gulberg, Johar Town, Model Town, Bahria Town, Cantt, Garden Town, Iqbal Town, Wapda Town, and Faisal Town. We are continuously expanding — check the app for the latest coverage in your area.',
      },
      {
        q: 'Can I schedule a delivery for a later time?',
        a: 'Currently, IshyMart operates on an on-demand model — orders are dispatched immediately after placement for the fastest possible delivery. Scheduled delivery is a feature we are actively working on and will be available soon.',
      },
      {
        q: 'What happens if I am not home when my order arrives?',
        a: 'Our rider will attempt to contact you via the phone number on your account. If unreachable, the rider may wait briefly and then return the order. Redelivery may incur an additional fee depending on circumstances.',
      },
      {
        q: 'Is there a minimum order value?',
        a: 'There is no minimum order requirement. However, orders below PKR 500 carry a delivery fee of PKR 79. Orders above PKR 999 qualify for free delivery.',
      },
    ],
  },
  {
    category: 'Payments',
    icon: '💳',
    items: [
      {
        q: 'What payment methods does IshyMart accept?',
        a: 'We accept major credit and debit cards (Visa, Mastercard), mobile wallets, and Cash on Delivery (COD) for eligible areas. Payment options available to you are shown at checkout.',
      },
      {
        q: 'Is it safe to pay online on IshyMart?',
        a: 'Yes. All online transactions are processed through PCI-DSS compliant payment gateways with TLS encryption. IshyMart never stores your full card details on our servers.',
      },
      {
        q: 'I was charged but my order was not placed. What should I do?',
        a: 'If a charge was processed but no order confirmation was received, the amount is typically reversed automatically within 3–7 business days. If it is not resolved, please contact us at support@ishymart.com with your transaction reference.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    icon: '🔄',
    items: [
      {
        q: 'What is IshyMart\'s return policy?',
        a: 'We accept return or refund claims for damaged, expired, incorrect, or tampered products. You must report the issue within 24 hours of receiving your delivery, with photographic evidence. See our full Return Policy for details.',
      },
      {
        q: 'How long does a refund take?',
        a: 'Approved refunds are processed within 3–5 business days to your original payment method. For COD orders, store credit is issued within 24 hours of approval.',
      },
      {
        q: 'Can I return fresh produce or frozen items?',
        a: 'Fresh fruits, vegetables, and frozen items are generally not eligible for return unless they were in an unsatisfactory condition at the time of delivery and reported within 24 hours with evidence.',
      },
    ],
  },
  {
    category: 'Account & Profile',
    icon: '👤',
    items: [
      {
        q: 'How do I create an IshyMart account?',
        a: 'You can register on our website or app using your email address. You will be asked to accept our Terms & Conditions before accessing the platform for the first time.',
      },
      {
        q: 'Can I change my delivery address after placing an order?',
        a: 'Address changes after order placement are not guaranteed. Please contact support immediately via the live chat or at support@ishymart.com — we will do our best to accommodate the change before dispatch.',
      },
      {
        q: 'How do I delete my account?',
        a: 'You can request account deletion by contacting support@ishymart.com. We will process your request within 5 business days, subject to any outstanding orders or legal retention obligations.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Use the "Forgot Password" option on the login page. A reset link will be sent to your registered email address. If you do not receive it, check your spam folder or contact support.',
      },
    ],
  },
  {
    category: 'Products & Quality',
    icon: '🥦',
    items: [
      {
        q: 'How does IshyMart ensure product quality?',
        a: 'All products are sourced from verified suppliers and stored in controlled-temperature facilities where applicable. We conduct regular quality checks. Any product found to not meet our standards is removed from our catalogue.',
      },
      {
        q: 'Are the prices on IshyMart the same as in-store?',
        a: 'Our prices are competitive and reflect market rates in Lahore. Prices are updated regularly and may vary slightly from physical store prices due to logistics and operational costs.',
      },
      {
        q: 'What if a product I ordered is out of stock?',
        a: 'If an item in your order is unavailable at the time of dispatch, you will be notified immediately. You can choose a substitute or receive a full refund for the out-of-stock item.',
      },
    ],
  },
  {
    category: 'Support & Contact',
    icon: '💬',
    items: [
      {
        q: 'How can I contact IshyMart support?',
        a: 'You can reach us via the live chat widget in the app, by emailing support@ishymart.com, or by calling +92 300 123 4567 during service hours (8 AM – 11 PM daily).',
      },
      {
        q: 'How quickly does IshyMart support respond?',
        a: 'Live chat requests are typically answered within a few minutes during business hours. Email enquiries are responded to within 1 business day. Urgent order-related issues are prioritised.',
      },
      {
        q: 'How do I send a message to the admin team?',
        a: 'Logged-in users can use the Messages feature (the message icon in the navigation bar) to send a direct message to our team. Admins will reply and you will also receive an email notification.',
      },
    ],
  },
]

export default function FaqsPage() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')

  const toggle = (key: string) => setOpenMap((p) => ({ ...p, [key]: !p[key] }))

  const filtered = search.trim()
    ? faqs.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : faqs

  return (
    <main className="min-h-screen bg-green-50/30">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-5">
            <HelpCircle className="w-7 h-7 text-green-200" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Frequently Asked Questions</h1>
          <p className="text-green-200 text-sm">Last updated: June 2025</p>
          <p className="text-green-100 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            Find quick answers to the most common questions about IshyMart's services, delivery, payments, and more.
          </p>

          {/* Search */}
          <div className="mt-7 max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-gray-800 text-sm rounded-full pl-10 pr-5 py-3 outline-none shadow-lg focus:ring-2 focus:ring-green-400 placeholder:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-green-700 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">FAQs</span>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-8">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-500">No results found</p>
            <p className="text-sm mt-1">Try a different search term.</p>
          </div>
        )}

        {filtered.map((cat) => (
          <div key={cat.category}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{cat.icon}</span>
              <h2 className="text-base font-bold text-gray-800">{cat.category}</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
              {cat.items.map((item, i) => {
                const key = `${cat.category}-${i}`
                const isOpen = !!openMap[key]
                return (
                  <div key={key}>
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-green-50/60 transition-all group"
                    >
                      <span className={`text-sm font-semibold pr-4 ${isOpen ? 'text-green-700' : 'text-gray-800'}`}>
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-green-600' : 'text-gray-400'}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1">
                        <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Still need help */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-2xl p-6 text-white text-center">
          <p className="font-bold text-lg mb-1">Still have a question?</p>
          <p className="text-green-200 text-sm mb-5">Our support team is available daily from 8 AM to 11 PM.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:support@ishymart.com"
              className="bg-white text-green-800 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-green-50 transition-all"
            >
              Email Us
            </a>
            <Link
              href="/contact"
              className="border border-white/40 text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-white/10 transition-all"
            >
              Contact Page
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
