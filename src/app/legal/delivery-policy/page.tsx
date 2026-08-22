// src/app/delivery-policy/page.tsx
import React from 'react'
import Link from 'next/link'
import { Truck, ChevronRight, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react'

const zones = [
  { area: 'DHA Phases 1–8', eta: '8–12 minutes', available: true },
  { area: 'Gulberg I, II, III, IV, V', eta: '8–12 minutes', available: true },
  { area: 'Johar Town', eta: '10–15 minutes', available: true },
  { area: 'Model Town', eta: '10–15 minutes', available: true },
  { area: 'Bahria Town Lahore', eta: '12–18 minutes', available: true },
  { area: 'Cantt / Saddar', eta: '10–15 minutes', available: true },
  { area: 'Iqbal Town / Garden Town', eta: '12–18 minutes', available: true },
  { area: 'Faisal Town / Wapda Town', eta: '15–20 minutes', available: true },
  { area: 'Outside Lahore', eta: 'N/A', available: false },
]

const conditions = [
  { title: 'Accurate Address', desc: 'You must provide a precise delivery address including building name, floor, and nearby landmark. Deliveries cannot be made to unspecified or restricted locations.' },
  { title: 'Accessible Location', desc: 'Our delivery riders must be able to physically access your delivery point. Deliveries to areas with restricted entry (gated societies, security checkpoints) may require advance coordination.' },
  { title: 'Recipient Availability', desc: 'Someone must be present to receive the order at the time of delivery. If no one is available, our rider will attempt contact. Unattended deliveries are left at your own risk.' },
  { title: 'Failed Deliveries', desc: 'If a delivery fails due to an incorrect address or recipient unavailability, a re-delivery fee may apply. IshyMart is not liable for any loss or damage resulting from failed deliveries caused by customer error.' },
]

export default function DeliveryPolicyPage() {
  return (
    <main className="min-h-screen bg-green-50/30">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-5">
            <Truck className="w-7 h-7 text-green-200" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Delivery Policy</h1>
          <p className="text-green-200 text-sm">Last updated: June 2025 &nbsp;·&nbsp; Effective immediately</p>
          <p className="text-green-100 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            IshyMart promises fast, reliable grocery delivery across Lahore. Here is everything you need to know about how our delivery service works.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-green-700 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">Delivery Policy</span>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-8">

        {/* 10-min promise card */}
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-6 flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-green-700">10'</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Our 10-Minute Delivery Promise</h2>
            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
              IshyMart aims to deliver your order within <strong>10 minutes</strong> across our core Lahore service zones. This commitment is subject to order volume, traffic conditions, weather, and geographic factors. While we make every effort to meet this target, actual delivery times may vary.
            </p>
          </div>
        </div>

        {/* Service Hours */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-green-700" />
            <h2 className="font-bold text-gray-800 text-lg">Service Hours</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { day: 'Monday – Friday', hours: '8:00 AM – 11:00 PM' },
              { day: 'Saturday – Sunday', hours: '8:00 AM – 11:00 PM' },
              { day: 'Public Holidays', hours: '9:00 AM – 9:00 PM (reduced zones)' },
              { day: 'Ramadan (Sehri Hours)', hours: '2:00 AM – 4:00 AM (select areas)' },
            ].map((row) => (
              <div key={row.day} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium">{row.day}</p>
                <p className="text-gray-800 font-bold text-sm mt-1">{row.hours}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-700" />
            <h2 className="font-bold text-gray-800 text-lg">Delivery Zones — Lahore</h2>
          </div>
          <div className="space-y-2">
            {zones.map((zone) => (
              <div key={zone.area} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  {zone.available
                    ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-gray-300 shrink-0" />
                  }
                  <span className={`text-sm font-medium ${zone.available ? 'text-gray-700' : 'text-gray-400'}`}>{zone.area}</span>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${zone.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {zone.available ? zone.eta : 'Not Available'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Delivery zones may expand over time. Check the app for the latest availability in your area.</p>
        </div>

        {/* Delivery Fees */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">Delivery Fees</h2>
          <div className="space-y-3">
            {[
              { condition: 'Orders above PKR 999', fee: 'Free Delivery', highlight: true },
              { condition: 'Orders PKR 500 – 998', fee: 'PKR 49', highlight: false },
              { condition: 'Orders below PKR 500', fee: 'PKR 79', highlight: false },
              { condition: 'Express Peak Hour (8–10 PM)', fee: 'PKR 29 surcharge', highlight: false },
            ].map((row) => (
              <div key={row.condition} className={`flex items-center justify-between py-3 px-4 rounded-xl border ${row.highlight ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                <span className="text-sm text-gray-700">{row.condition}</span>
                <span className={`text-sm font-bold ${row.highlight ? 'text-green-700' : 'text-gray-800'}`}>{row.fee}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-5">Delivery Conditions</h2>
          <div className="space-y-5">
            {conditions.map((c) => (
              <div key={c.title} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{c.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delays notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-amber-800 text-sm">When Delays May Occur</p>
            <p className="text-amber-700 text-sm mt-1">
              Delivery times may exceed the estimated window during heavy rainfall, fog, road closures, public holidays, high-demand periods (e.g., Eid, Ramazan), or other force majeure events. We will proactively notify you via the app if your order is significantly delayed.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-2xl p-6 text-white text-center">
          <p className="font-bold text-lg mb-1">Delivery Issue?</p>
          <p className="text-green-200 text-sm mb-4">Contact our support team and we will resolve it immediately.</p>
          <a
            href="mailto:support@ishymart.com"
            className="inline-block bg-white text-green-800 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-green-50 transition-all"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  )
}

