'use client'
// src/app/contact/page.tsx
import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, Send, ChevronRight, Loader2, CheckCircle } from 'lucide-react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

export default function ContactPage() {
  const { data: session } = useSession()
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/support/form', {
        name: form.name,
        email: form.email,
        message: `Subject: ${form.subject}\n\n${form.message}`,
      })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5 text-green-600" />,
      label: 'Email',
      value: 'support@ishymart.com',
      href: 'mailto:asadpkonoff@gmail.com',
    },
    {
      icon: <Phone className="w-5 h-5 text-green-600" />,
      label: 'Phone',
      value: '+92 300 123 4567',
      href: 'tel:+923001234567',
    },
    {
      icon: <MapPin className="w-5 h-5 text-green-600" />,
      label: 'Location',
      value: 'Bhakkar, Punjab, Pakistan',
      href: null,
    },
    {
      icon: <Clock className="w-5 h-5 text-green-600" />,
      label: 'Support Hours',
      value: 'Daily, 8:00 AM – 11:00 PM (PKT)',
      href: null,
    },
  ]

  return (
    <main className="min-h-screen bg-green-50/30">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-5">
            <Mail className="w-7 h-7 text-green-200" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Contact Us</h1>
          <p className="text-green-100 mt-2 max-w-md mx-auto text-sm leading-relaxed">
            Have a question, complaint, or feedback? We are here to help — reach out any time.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-green-700 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">Contact</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-5 gap-8">

          {/* Left: Info */}
          <div className="md:col-span-2 space-y-5">
            {/* Contact cards */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-800 text-base">Get In Touch</h2>
              {contactInfo.map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-sm text-gray-800 font-semibold hover:text-green-700 transition-colors">
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-800 font-semibold">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Response time */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <p className="font-semibold text-green-800 text-sm mb-2">⚡ Response Times</p>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex justify-between"><span>Live Chat</span><strong>~2 minutes</strong></li>
                <li className="flex justify-between border-t border-green-200 pt-2"><span>Email</span><strong>Within 24 hours</strong></li>
                <li className="flex justify-between border-t border-green-200 pt-2"><span>Order Issues</span><strong>Priority — &lt;1 hour</strong></li>
              </ul>
            </div>

            {/* Links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">Helpful Links</p>
              {[
                { label: 'FAQs', href: '/legal/faqs' },
                { label: 'Return Policy', href: '/legal/return-policy' },
                { label: 'Delivery Policy', href: '/legal/delivery-policy' },
                { label: 'Terms & Conditions', href: '/legal/terms' },
              ].map((l) => (
                <Link key={l.label} href={l.href}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors py-1">
                  <ChevronRight className="w-3.5 h-3.5 text-green-500" />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h3 className="text-xl font-bold text-green-700">Message Sent!</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Thank you for reaching out. Our support team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                    className="text-green-600 text-sm underline underline-offset-2 mt-2"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-bold text-gray-800 text-lg mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                        <input
                          name="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Email Address *</label>
                        <input
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Subject *</label>
                      <select
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-700"
                      >
                        <option value="">Select a subject</option>
                        <option value="Order Issue">Order Issue</option>
                        <option value="Delivery Problem">Delivery Problem</option>
                        <option value="Refund Request">Refund Request</option>
                        <option value="Account Help">Account Help</option>
                        <option value="Product Quality">Product Quality</option>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Message *</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Describe your issue or question in detail..."
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-xs">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                        : <><Send className="w-4 h-4" /> Send Message</>
                      }
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      By submitting this form, you agree to our{' '}
                      <Link href="/legal/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}