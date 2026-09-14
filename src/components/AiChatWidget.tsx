'use client'

import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'motion/react'
import { Bot, Loader2, Send, Sparkles, X } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function AiChatWidget() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const role = session?.user?.role

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Sirf normal user aur delivery boy ke liye AI chat button dikhega
  if (role !== 'user' && role !== 'deliveryBoy') {
    return null
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post('/api/ai-chat', { messages: nextMessages })
      const reply: string = res.data?.reply || 'Maazrat, jawab nahi mil saka.'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])

      if (res.data?.action === 'open_support') {
        setOpen(false)
        // Nav.tsx ke support button ko trigger karo (id="support-widget-btn")
        setTimeout(() => {
          document.getElementById('support-widget-btn')?.click()
        }, 150)
      }
    } catch (err: any) {
      const errText =
        err?.response?.data?.message || 'Kuch masla ho gaya, thori der baad try karein.'
      setMessages((prev) => [...prev, { role: 'assistant', content: errText }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button — left side */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-6 left-4 sm:left-6 z-[60] bg-green-700 hover:bg-green-800 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-green-900/30 hover:scale-105 transition-all"
        title="AI Assistant"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-4 sm:left-6 z-[60] w-[90vw] max-w-sm h-[70vh] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-green-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 text-white px-4 py-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm leading-none">IshyMart Assistant</p>
                <p className="text-[11px] text-green-100">Always here to help</p>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-green-50/40">
              {messages.length === 0 && (
                <div className="text-center text-xs text-gray-500 mt-6 px-4">
                  {role === 'deliveryBoy'
                    ? 'Apne delivered ya pending orders ke baare mein pooch sakte hain.'
                    : 'Products, prices, apne orders, ya store policies ke baare mein pooch sakte hain.'}
                </div>
              )}
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-green-700 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Typing...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-2 border-t border-gray-100 flex items-center gap-2 bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage()
                }}
                placeholder="Apna sawal likhein..."
                className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 outline-none focus:border-green-500"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
