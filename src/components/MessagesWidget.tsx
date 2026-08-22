'use client'
// src/components/MessagesWidget.tsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Loader2, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  from: 'user' | 'admin'
  senderName: string
  text: string
  time: string
  read: boolean
}

export default function MessagesWidget({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/messages/get')
      setMessages(res.data.messages || [])
    } catch (err) {
      setError('Messages load nahi hue. Dobara try karein.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  useEffect(() => {
    if (messages.length === 0) return // pehle load hone do
    const interval = setInterval(() => {
      fetchMessages()
    }, 10000)
    return () => clearInterval(interval)
  }, [messages.length])

  const handleSend = async () => {
    if (!inputText.trim()) return
    const text = inputText.trim()
    setInputText('')
    setSending(true)
    setError('')

    // Optimistic UI
    const tempMsg: Message = {
      id: Date.now().toString(),
      from: 'user',
      senderName: session?.user?.name || 'You',
      text,
      time: new Date().toISOString(),
      read: false,
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      await axios.post('/api/messages/send', { text })
    } catch (err) {
      setError('Message send nahi hua. Dobara try karein.')
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
    } finally {
      setSending(false)
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-PK', {
      timeZone: 'Asia/Karachi',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 sm:hidden" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="fixed z-50 bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden
          inset-x-3 bottom-3 top-16 rounded-2xl
          sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[370px] sm:h-[560px] sm:top-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Messages</p>
              <p className="text-green-200 text-xs">IshyMart Seller Team</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMessages}
              className="text-white/70 hover:text-white transition-colors p-1"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-green-400" />
              </div>
              <p className="font-semibold text-gray-700">No Messages Has Been Arrived</p>
              <p className="text-gray-400 text-sm">
                Write Your First Message! We Will Reply Soon.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[82%] space-y-1`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm ${
                        msg.from === 'user'
                          ? 'bg-green-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.from === 'admin' && (
                        <p className="text-xs font-semibold text-green-700 mb-0.5">
                          {msg.senderName} • Admin
                        </p>
                      )}
                      <p>{msg.text}</p>
                    </div>
                    <p className={`text-xs text-gray-400 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.time)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs text-center px-4 py-1 shrink-0">{error}</p>
        )}

        {/* Info bar */}
        <div className="bg-amber-50 border-t border-amber-100 px-4 py-2 shrink-0">
          <p className="text-amber-700 text-xs text-center">
            💡 Messages Will Be Removed After 10 Days. Soon Seller Team Will Reply and You Will Got a Email.
          </p>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-3 flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="Type Your Message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all shrink-0"
          >
            {sending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
      </motion.div>
    </>
  )
}
