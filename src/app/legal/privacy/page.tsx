// src/app/privacy/page.tsx
import React from 'react'
import Link from 'next/link'
import { ShieldCheck, ChevronRight } from 'lucide-react'

const sections = [
  {
    id: '1',
    title: 'Information We Collect',
    content: `When you create an account or place an order on IshyMart, we collect the following categories of personal information: (a) Identity Data — your full name, email address, and mobile number; (b) Location Data — your delivery address and, with your consent, your device's GPS location; (c) Transaction Data — details of products ordered, payment method type (not full card numbers), and order history; (d) Technical Data — your IP address, browser type, device identifiers, and usage logs. We do not collect sensitive personal data such as financial account details or national identity numbers.`,
  },
  {
    id: '2',
    title: 'How We Use Your Information',
    content: `Your personal data is used exclusively for the following purposes: processing and delivering your orders; sending order confirmations, updates, and support communications; improving and personalising your experience on the platform; preventing fraud and maintaining platform security; complying with legal obligations applicable in Pakistan; and sending promotional emails which you may unsubscribe from at any time. We do not engage in automated decision-making or profiling that produces legal or similarly significant effects.`,
  },
  {
    id: '3',
    title: 'Data Sharing & Third Parties',
    content: `IshyMart does not sell, rent, or trade your personal data to third parties for their marketing purposes. We may share limited data with: (a) Delivery partners who need your address to complete your order; (b) Payment processors who handle transactions securely in compliance with PCI-DSS standards; (c) Cloud service providers (e.g., database and storage vendors) who process data on our behalf under strict data processing agreements; (d) Law enforcement agencies if required by applicable Pakistani law or court order.`,
  },
  {
    id: '4',
    title: 'Data Retention',
    content: `We retain your account data for as long as your account remains active or as required to fulfil legal obligations. Transaction records are retained for a minimum of five years in compliance with Pakistani financial regulations. Chat and support messages stored via our Redis-based system are automatically purged after 10 days. You may request deletion of your personal data at any time, subject to our legal retention obligations.`,
  },
  {
    id: '5',
    title: 'Cookies & Tracking',
    content: `IshyMart uses cookies and similar technologies to maintain your session, remember your preferences, and analyse usage patterns. Essential cookies are required for the platform to function. Analytics cookies are used to understand how users interact with our service, and you may opt out of these through your browser settings. We do not use third-party advertising cookies.`,
  },
  {
    id: '6',
    title: 'Data Security',
    content: `We implement industry-standard technical and organisational measures to protect your data, including TLS encryption for data in transit, AES-256 encryption for sensitive data at rest, role-based access controls limiting who can access your data internally, and regular security audits. While we take every precaution, no internet-based service can guarantee absolute security. You are responsible for maintaining the confidentiality of your account password.`,
  },
  {
    id: '7',
    title: 'Your Rights',
    content: `You have the right to: access the personal data we hold about you; request correction of any inaccurate information; request deletion of your account and associated data (subject to legal retention requirements); withdraw consent to marketing communications at any time; lodge a complaint with the relevant data protection authority in Pakistan. To exercise any of these rights, please contact us at support@ishymart.com.`,
  },
  {
    id: '8',
    title: 'Children\'s Privacy',
    content: `IshyMart is not directed at or intended for use by individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has provided personal information without parental consent, we will promptly delete such data from our records.`,
  },
  {
    id: '9',
    title: 'Changes to This Policy',
    content: `IshyMart may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. When material changes are made, we will notify you via email to your registered address at least 14 days before the changes take effect. We encourage you to review this policy regularly.`,
  },
  {
    id: '10',
    title: 'Contact & Complaints',
    content: `For any privacy-related queries, data access requests, or complaints, please contact our support team at support@ishymart.com or write to us at our registered address in Bhakkar, Punjab, Pakistan. We aim to respond to all privacy enquiries within 5 business days.`,
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-green-50/30">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-5">
            <ShieldCheck className="w-7 h-7 text-green-200" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-green-200 text-sm">Last updated: June 2025 &nbsp;·&nbsp; Effective immediately</p>
          <p className="text-green-100 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            At IshyMart, your privacy is a core commitment — not an afterthought. This policy explains exactly how we collect, use, and protect your personal data.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-green-700 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">Privacy Policy</span>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        {/* Intro card */}
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 mb-8">
          <p className="text-gray-600 text-sm leading-relaxed">
            This Privacy Policy applies to all services provided by <strong className="text-green-800">IshyMart</strong>, including our website and mobile applications. It describes how we handle personal information in compliance with applicable Pakistani laws and international best practices.
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
          <p className="font-bold text-lg mb-1">Privacy Questions?</p>
          <p className="text-green-200 text-sm mb-4">Contact our dedicated privacy support team.</p>
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

