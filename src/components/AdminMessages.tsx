'use client'
// src/components/AdminMessages.tsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, ArrowLeft, Loader2, RefreshCw, User } from 'lucide-react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  from: 'user' | 'admin'
  senderName: string
  text: string
  time: string
}

interface Conversation {
  id: string
  name: string
  email: string
  lastMessage: string
  lastTime: string
}

export default function AdminMessages() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    setLoadingConvs(true)
    try {
      const res = await axios.get('/api/messages/conversations')
      setConversations(res.data.conversations || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingConvs(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  const openConversation = async (conv: Conversation) => {
    setSelectedUser(conv)
    setLoadingMsgs(true)
    try {
      const res = await axios.post('/api/messages/conversations', { userId: conv.id })
      setMessages(res.data.messages || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMsgs(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!selectedUser) return
    const interval = setInterval(() => {
      openConversation(selectedUser)
    }, 10000)
    return () => clearInterval(interval)
  }, [selectedUser?.id])

  const handleReply = async () => {
    if (!inputText.trim() || !selectedUser) return
    const text = inputText.trim()
    setInputText('')
    setSending(true)

    // Optimistic UI
    const tempMsg: Message = {
      id: Date.now().toString(),
      from: 'admin',
      senderName: session?.user?.name || 'Admin',
      text,
      time: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      await axios.post('/api/messages/reply', {
        userId: selectedUser.id,
        userEmail: selectedUser.email,
        userName: selectedUser.name,
        text,
      })
      // Conversations refresh karo
      fetchConversations()
    } catch (err) {
      console.error(err)
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[600px] flex">

      {/* ── LEFT: Conversations List ── */}
      <div className={`w-full sm:w-72 border-r border-gray-200 flex flex-col ${selectedUser ? 'hidden sm:flex' : 'flex'}`}>
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-white" />
            <p className="text-white font-bold text-sm">Customer Messages</p>
          </div>
          <button onClick={fetchConversations} className="text-white/70 hover:text-white p-1">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
              <MessageSquare className="w-10 h-10 text-gray-300" />
              <p className="text-gray-500 text-sm">No Message Has Been Arrived</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-green-50 transition-all text-left ${
                  selectedUser?.id === conv.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{conv.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTime(conv.lastTime)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT: Chat Window ── */}
      <div className={`flex-1 flex flex-col ${selectedUser ? 'flex' : 'hidden sm:flex'}`}>
        {!selectedUser ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">PLease Select The Conversation To Reply</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSelectedUser(null)}
                className="sm:hidden text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{selectedUser.name}</p>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => openConversation(selectedUser)}
                className="ml-auto text-gray-400 hover:text-green-600 p-1"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-8">No Message Has Been Arrived</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[75%] space-y-1">
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm ${
                          msg.from === 'admin'
                            ? 'bg-gray-800 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        {msg.from === 'user' && (
                          <p className="text-xs font-semibold text-green-600 mb-0.5">{msg.senderName}</p>
                        )}
                        <p>{msg.text}</p>
                      </div>
                      <p className={`text-xs text-gray-400 ${msg.from === 'admin' ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div className="border-t border-gray-200 p-3 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder={`${selectedUser.name} ko reply likhein...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                className="flex-1 border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <button
                onClick={handleReply}
                disabled={!inputText.trim() || sending}
                className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all shrink-0"
              >
                {sending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
