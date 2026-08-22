'use client'
import axios from 'axios'
import { Send, Sparkles } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { getSocket } from '@/app/lib/socket'

interface ChatMessage {
  sender: 'buyer' | 'deliveryBoy'
  senderId: string
  text: string
  createdAt: string
}

function OrderChatWidget({ orderId, role }: { orderId: string; role: 'buyer' | 'deliveryBoy' }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/order-chat/${orderId}`)
      setMessages(res.data.messages)
    } catch {
      // ignore
    }
  }

  // ─── Ek dafa purane messages le lo, us k baad naye messages Socket.IO se
  // real-time aayenge (parent component — DeliveryBoy/TrackOrderPage —
  // pehle se hi `order:{orderId}` room mein connected/joined hota hai) ────
  useEffect(() => {
    fetchMessages()
  }, [orderId])

  useEffect(() => {
    const socket = getSocket()
    const handler = (msg: ChatMessage) => {
      // Apna hi bheja hua message socket se wapis na aaye (woh already
      // optimistically REST response se add ho chuka hota hai) — sirf
      // dusri taraf (buyer <-> deliveryBoy) ka naya message yahan add hoga
      if (msg.sender === role) return
      setMessages((prev) => [...prev, msg])
    }
    socket.on('order:chatMessage', handler)
    return () => {
      socket.off('order:chatMessage', handler)
    }
  }, [orderId, role])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (overrideText?: string) => {
    const value = (overrideText ?? text).trim()
    if (!value) return
    setText('')
    setSuggestions([])
    try {
      const res = await axios.post(`/api/order-chat/${orderId}`, { text: value })
      setMessages(res.data.messages)
    } catch {
      // ignore
    }
  }

  const getSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      const res = await axios.post(`/api/order-chat/${orderId}/ai-suggest`)
      setSuggestions(res.data.suggestions || [])
    } catch {
      // ignore
    } finally {
      setLoadingSuggestions(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 flex flex-col h-[420px]">
      <div className="px-4 py-3 border-b border-gray-100 font-bold text-gray-800 text-sm">Chat</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-gray-400 text-xs text-center mt-6">No messages yet. Say hi 👋</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === role ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                m.sender === role
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {suggestions.length > 0 && (
        <div className="px-3 pb-1 flex flex-wrap gap-1.5">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 p-3 flex gap-2 items-center">
        <button
          onClick={getSuggestions}
          disabled={loadingSuggestions}
          title="AI suggestions"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${loadingSuggestions ? 'animate-pulse' : ''}`} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={() => send()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default OrderChatWidget
