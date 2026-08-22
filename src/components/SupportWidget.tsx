'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageCircle, Mail, Send, X, Clock, CheckCircle, Loader2, ChevronRight, Paperclip, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { getSocket, disconnectSocket } from '@/app/lib/socket'

interface Message {
  sender: 'user' | 'admin'
  senderName: string
  text?: string
  fileName?: string
  fileUrl?: string
  fileType?: string
  type?: 'text' | 'file'
  createdAt: Date
}

type View = 'home' | 'form' | 'chat-waiting' | 'chat-active' | 'chat-closed'

export default function SupportWidget({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession()
  const [view, setView] = useState<View>('home')

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formSent, setFormSent] = useState(false)

  const [roomId, setRoomId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [adminName, setAdminName] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [waitTime, setWaitTime] = useState(0)
  const [adminTyping, setAdminTyping] = useState(false)

  // FIX 2: File upload states
  const [fileUploading, setFileUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  useEffect(() => {
    if (session?.user) {
      setFormName(session.user.name || '')
      setFormEmail(session.user.email || '')
    }
  }, [session])

  useEffect(() => {
    if (view !== 'chat-waiting') return
    const timer = setInterval(() => setWaitTime((p) => p + 1), 1000)
    return () => clearInterval(timer)
  }, [view])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, adminTyping])

  const formatWait = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  const handleStartChat = async () => {
    setChatLoading(true)
    try {
      const res = await axios.post('/api/support/start')
      const { roomId: rid } = res.data
      setRoomId(rid)
      setWaitTime(0)

      const socket = getSocket()
      socket.connect()

      socket.emit('chat:start', {
        roomId: rid,
        userId: session?.user?.id,
        userName: session?.user?.name,
      })

      socket.on('chat:admin-joined', ({ adminName: aName }: { adminName: string }) => {
        setAdminName(aName)
        setView('chat-active')
        setMessages([
          {
            sender: 'admin',
            senderName: aName,
            text: `Assalam o Alaikum! Main ${aName} hoon, IshyMart Support se. Aapki kya madad kar sakta hoon?`,
            type: 'text',
            createdAt: new Date(),
          },
          {
            sender: 'admin',
            senderName: aName,
            text: '🛒 Welcome to IshyMart Live Support! Hum aapki madad ke liye yahan hain.',
            type: 'text',
            createdAt: new Date(),
          },
        ])
      })

      socket.on('chat:message', (msg: Message) => {
        setAdminTyping(false)
        setMessages((prev) => [...prev, { ...msg, type: 'text' }])
      })

      // FIX 2: File receive event
      socket.on('chat:file', (msg: Message) => {
        setAdminTyping(false)
        setMessages((prev) => [...prev, { ...msg, type: 'file' }])
      })

      // FIX 1: Typing — ab yeh sahi kaam karega kyunki server bhi relay karega
      socket.on('chat:typing', ({ isTyping }: { isTyping: boolean }) => {
        setAdminTyping(isTyping)
      })

      socket.on('chat:admin-left', () => {
        setAdminTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            sender: 'admin',
            senderName: 'System',
            text: '⚠️ Admin disconnect ho gaya. Dobara try karein.',
            type: 'text',
            createdAt: new Date(),
          },
        ])
      })

      // FIX 4: Chat closed by admin — ab user ko notification milegi
      socket.on('chat:closed', () => {
        setAdminTyping(false)
        setView('chat-closed')
        disconnectSocket()
      })

      setView('chat-waiting')
    } catch (err) {
      console.error(err)
    } finally {
      setChatLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    const socket = getSocket()
    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('chat:typing', { roomId, isTyping: true, senderName: session?.user?.name || 'User' })
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      socket.emit('chat:typing', { roomId, isTyping: false })
    }, 1500)
  }

  const handleSendMessage = () => {
    if (!inputText.trim() || !roomId) return
    const text = inputText.trim()
    setInputText('')
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    isTypingRef.current = false
    const socket = getSocket()
    socket.emit('chat:typing', { roomId, isTyping: false })
    socket.emit('chat:message', {
      roomId,
      sender: 'user',
      senderName: session?.user?.name || 'User',
      text,
    })
    setMessages((prev) => [
      ...prev,
      { sender: 'user', senderName: session?.user?.name || 'User', text, type: 'text', createdAt: new Date() },
    ])
  }

  // FIX 2: File upload handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !roomId) return

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert('File size 5MB se zyada nahi ho sakti')
      return
    }

    setFileUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post('/api/support/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const { fileUrl, fileName, fileType } = res.data

      const socket = getSocket()
      socket.emit('chat:file', {
        roomId,
        sender: 'user',
        senderName: session?.user?.name || 'User',
        fileName,
        fileUrl,
        fileType,
      })

      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          senderName: session?.user?.name || 'User',
          fileName,
          fileUrl,
          fileType,
          type: 'file',
          createdAt: new Date(),
        },
      ])
    } catch (err) {
      console.error('File upload failed:', err)
      alert('File upload fail ho gayi. Dobara try karein.')
    } finally {
      setFileUploading(false)
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      await axios.post('/api/support/form', {
        name: formName,
        email: formEmail,
        message: formMessage,
      })
      setFormSent(true)
    } catch (err) {
      console.error(err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleClose = () => {
    if (roomId && view !== 'chat-closed') {
      const socket = getSocket()
      socket.emit('chat:close', { roomId })
    }
    disconnectSocket()
    onClose()
  }

  // File message bubble
  const FileMessageBubble = ({ msg, isUser }: { msg: Message; isUser: boolean }) => {
    const isImage = msg.fileType?.startsWith('image/')
    return (
      <a
        href={msg.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 max-w-[80%] rounded-2xl px-4 py-3 text-sm transition-opacity hover:opacity-80 ${
          isUser
            ? 'bg-green-600 text-white rounded-br-sm ml-auto'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {isImage ? (
          <ImageIcon className="w-4 h-4 shrink-0" />
        ) : (
          <FileText className="w-4 h-4 shrink-0" />
        )}
        <span className="truncate max-w-[160px] underline underline-offset-2">{msg.fileName}</span>
      </a>
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 sm:hidden" onClick={handleClose} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="fixed z-50 bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden
          inset-x-3 bottom-3 top-16 rounded-2xl
          sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[370px] sm:h-[580px] sm:top-auto sm:rounded-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">IshyMart Support</p>
              <p className="text-green-200 text-xs">
                {view === 'chat-active' ? `${adminName} • Online` : 'We are here to Help'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* HOME */}
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col p-5 gap-4"
            >
              <p className="text-gray-600 text-sm text-center">Need help with an issue? Please select an option:</p>
              <button onClick={handleStartChat} disabled={chatLoading}
                className="flex items-center gap-4 p-4 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  {chatLoading ? <Loader2 className="w-5 h-5 text-green-600 animate-spin" /> : <MessageCircle className="w-5 h-5 text-green-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">Live Chat</p>
                  <p className="text-gray-500 text-xs">Direct Your Inquiry To The Admin</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button onClick={() => setView('form')}
                className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">Drop a Message</p>
                  <p className="text-gray-500 text-xs">Fill the Form, We will Reply</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </motion.div>
          )}

          {/* FORM */}
          {view === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col p-5 gap-4 overflow-y-auto flex-1"
            >
              {formSent ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <p className="font-bold text-green-700">Message Has Been Sent!</p>
                  <p className="text-gray-500 text-sm">We will get back to you soon.</p>
                  <button
                    onClick={() => { setView('home'); setFormSent(false); setFormMessage('') }}
                    className="text-green-600 text-sm underline"
                  >
                    Go Back
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => setView('home')} className="text-gray-500 text-xs hover:text-gray-700 self-start">← Back</button>
                  <p className="text-gray-700 font-semibold text-sm">Please state your problem:</p>
                  <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
                    <input type="text" placeholder="Your Name...." value={formName} onChange={(e) => setFormName(e.target.value)} required
                      className="w-full border border-gray-300 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <input type="email" placeholder="Email address" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required
                      className="w-full border border-gray-300 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    <textarea placeholder="Let us know what the issue is..." value={formMessage} onChange={(e) => setFormMessage(e.target.value)} required rows={4}
                      className="w-full border border-gray-300 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none" />
                    <button type="submit" disabled={formLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                      {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}

          {/* WAITING */}
          {view === 'chat-waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-8 gap-5 flex-1"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
                <Clock className="w-6 h-6 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-gray-800">Please wait for support team Admins</p>
                <p className="text-gray-500 text-sm">Notification has been sent to Admins</p>
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-2">
                  <p className="text-green-700 text-xs font-medium">⏱ Wait time</p>
                  <p className="text-green-800 text-2xl font-bold">{formatWait(waitTime)}</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">Waiting for the admin to join and start the chat</p>
            </motion.div>
          )}

          {/* FIX 4: CHAT CLOSED VIEW — admin ny chat band ki to yeh screen aayegi */}
          {view === 'chat-closed' && (
            <motion.div key="closed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-8 gap-5 flex-1 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-800 text-lg">Chat Has Been Closed</p>
                <p className="text-gray-500 text-sm">Admin has closed the chat. Hopefully, the issue you were facing is now settled!</p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => { setView('home'); setMessages([]); setRoomId(''); setAdminName('') }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                >
                  New Support Request
                </button>
                <button onClick={onClose} className="w-full border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl transition-all text-sm hover:bg-gray-50">
                  All is ok. Thankyou!!
                </button>
              </div>
            </motion.div>
          )}

          {/* ACTIVE CHAT */}
          {view === 'chat-active' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.type === 'file' ? (
                      <FileMessageBubble msg={msg} isUser={msg.sender === 'user'} />
                    ) : (
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.sender === 'user'
                          ? 'bg-green-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.sender === 'admin' && (
                          <p className="text-xs font-semibold text-green-700 mb-0.5">{msg.senderName}</p>
                        )}
                        <p>{msg.text}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* FIX 1: Typing dots — ab sahi kaam karengy */}
                <AnimatePresence>
                  {adminTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-2 h-2 rounded-full bg-gray-400 block"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* FIX 2: Input bar mein file button add kiya */}
              <div className="border-t border-gray-200 p-3 flex gap-2 shrink-0">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={fileUploading}
                  title="File attach karein"
                  className="w-10 h-10 border border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:text-green-600 hover:border-green-400 transition-all shrink-0 disabled:opacity-50"
                >
                  {fileUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="text"
                  placeholder="Message likhein..."
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border border-gray-300 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </>
  )
}
