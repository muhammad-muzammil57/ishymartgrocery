// src/app/terms/page.tsx
import React from 'react'
import Link from 'next/link'
import { ScrollText, ChevronRight } from 'lucide-react'

const sections = [
  {
    id: '1',
    title: 'Acceptance of Terms',
    content: `By accessing or using IshyMart's platform — including our website and mobile applications — you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of our services immediately. These terms constitute a legally binding agreement between you and IshyMart (operated in Bhakkar, Punjab, Pakistan).`,
  },
  {
    id: '2',
    title: 'Services Overview',
    content: `IshyMart is an online grocery delivery platform serving Bhakkar, Punjab, Pakistan. We provide a digital marketplace where registered users can browse, order, and receive delivery of grocery and daily essentials products. We offer fast delivery, targeting a 10-minute delivery window within our operational zones, subject to availability and conditions described herein.`,
  },
  {
    id: '3',
    title: 'Eligibility & Account Registration',
    content: `To place orders on IshyMart, you must be at least 18 years of age and reside within our delivery area. You are responsible for maintaining the confidentiality of your account credentials. Any activity occurring under your account is your sole responsibility. IshyMart reserves the right to suspend or terminate accounts found to contain inaccurate, fraudulent, or incomplete information.`,
  },
  {
    id: '4',
    title: 'Orders & Pricing',
    content: `All product prices are listed in Pakistani Rupees (PKR) and are inclusive of applicable taxes unless stated otherwise. Prices are subject to change without prior notice. An order is confirmed only upon receipt of a confirmation notification from IshyMart. We reserve the right to cancel or modify orders in cases of pricing errors, stock unavailability, or suspected fraudulent activity. You will be notified promptly in such events.`,
  },
  {
    id: '5',
    title: 'Payments',
    content: `IshyMart accepts payments via approved methods listed at checkout. All transactions are processed securely. Your payment information is never stored on our servers beyond what is necessary for processing. In the event of a failed transaction, any amount debited will be reversed to your original payment method within 3–7 business days, subject to your bank's processing timelines.`,
  },
  {
    id: '6',
    title: 'Delivery Policy',
    content: `We strive to deliver within 10 minutes in our core Bhakkar service zones. Delivery timelines may be affected by factors beyond our control including traffic conditions, weather, high order volumes, or geographic constraints. You are responsible for providing an accurate and accessible delivery address. IshyMart shall not be liable for non-delivery or delays resulting from incorrect address information provided by the customer.`,
  },
  {
    id: '7',
    title: 'Returns & Refunds',
    content: `If you receive a damaged, expired, or incorrect product, you must notify IshyMart Support within 24 hours of delivery. Eligible refunds are processed within 3–5 business days to your original payment method. Perishable and frozen items may only be returned or refunded if they were found to be in unsatisfactory condition at the time of delivery and reported within the stipulated timeframe.`,
  },
  {
    id: '8',
    title: 'User Conduct',
    content: `You agree not to use IshyMart's platform for any unlawful, abusive, or fraudulent purposes, including placing fake orders, submitting false claims, reverse engineering our platform, or engaging in activities that disrupt service for other users. Violation of this section may result in immediate account suspension and potential legal action.`,
  },
  {
    id: '9',
    title: 'Intellectual Property',
    content: `All content on IshyMart's platform — including but not limited to the logo, branding, product descriptions, interface design, and code — is the exclusive property of IshyMart. Unauthorized reproduction, distribution, or commercial use of any part of this platform without express written permission is strictly prohibited.`,
  },
  {
    id: '10',
    title: 'Limitation of Liability',
    content: `IshyMart shall not be liable for indirect, incidental, or consequential damages arising from use of our services, including loss of data, loss of profits, or service interruptions. Our total liability to you for any claim arising from these terms shall not exceed the value of your most recent order placed on our platform.`,
  },
  {
    id: '11',
    title: 'Amendments',
    content: `IshyMart reserves the right to update or amend these Terms and Conditions at any time. Material changes will be communicated via email to your registered address. Continued use of the platform following notification of changes constitutes your acceptance of the revised terms.`,
  },
  {
    id: '12',
    title: 'Governing Law',
    content: `These Terms and Conditions are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Bhakkar, Punjab, Pakistan.`,
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-green-50/30">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-5">
            <ScrollText className="w-7 h-7 text-green-200" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Terms & Conditions</h1>
          <p className="text-green-200 text-sm">Last updated: June 2025 &nbsp;·&nbsp; Effective immediately</p>
          <p className="text-green-100 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            Please read these terms carefully before using IshyMart. By accessing our platform, you agree to the following legally binding conditions.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-green-700 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">Terms & Conditions</span>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        {/* Intro card */}
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 mb-8">
          <p className="text-gray-600 text-sm leading-relaxed">
            This document governs the relationship between <strong className="text-green-800">IshyMart</strong> and its users. IshyMart is a grocery delivery platform operating in Bhakkar, Punjab, Pakistan. These terms apply to all visitors, registered users, and anyone who interacts with our services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((sec) => (
            <div key={sec.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
                <span className="text-xs font-bold text-green-700 bg-green-100 rounded-full w-7 h-7 flex items-center justify-center shrink-0">
                  {sec.id}
                </span>
                <h2 className="text-base font-bold text-gray-800">{sec.title}</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-600 text-sm leading-relaxed">{sec.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact box */}
        <div className="mt-10 bg-gradient-to-r from-green-800 to-green-700 rounded-2xl p-6 text-white text-center">
          <p className="font-bold text-lg mb-1">Questions about our Terms?</p>
          <p className="text-green-200 text-sm mb-4">Our support team is available to clarify any of the above.</p>
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