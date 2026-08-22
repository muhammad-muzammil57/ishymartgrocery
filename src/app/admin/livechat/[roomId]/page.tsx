'use client'
import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Send, ShieldCheck, X, Paperclip, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { getSocket, disconnectSocket } from '@/app/lib/socket'
import axios from 'axios'

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

export default function AdminLiveChat() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)
  const [alreadyTaken, setAlreadyTaken] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [userTyping, setUserTyping] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleJoin = () => {
    setJoining(true)
    const socket = getSocket()
    socket.connect()

    socket.on('chat:already-taken', () => {
      setAlreadyTaken(true)
      setJoining(false)
      disconnectSocket()
    })

    socket.on('chat:message', (msg: Message) => {
      setUserTyping(false)
      setMessages((prev) => [...prev, { ...msg, type: 'text' }])
      scrollToBottom()
    })

    // FIX 2: File receive karo user se
    socket.on('chat:file', (msg: Message) => {
      setUserTyping(false)
      setMessages((prev) => [...prev, { ...msg, type: 'file' }])
      scrollToBottom()
    })

    // FIX 1: Typing indicator — ab server relay karta hai toh yeh kaam karega
    socket.on('chat:typing', ({ isTyping }: { isTyping: boolean }) => {
      setUserTyping(isTyping)
    })

    socket.on('chat:user-left', () => {
      setUserTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user' as const,
          senderName: 'System',
          text: '⚠️ Customer ne chat close kar di.',
          type: 'text',
          createdAt: new Date(),
        },
      ])
    })

    socket.emit('chat:join', {
      roomId,
      adminId: session?.user?.id,
      adminName: session?.user?.name,
    })

    setTimeout(() => {
      const adminName = session?.user?.name || 'Admin'
      setMessages([
        {
          sender: 'admin' as const,
          senderName: adminName,
          text: `Assalam o Alaikum! Main ${adminName} hoon, IshyMart Support se. Aapki kya madad kar sakta hoon?`,
          type: 'text',
          createdAt: new Date(),
        },
        {
          sender: 'admin' as const,
          senderName: adminName,
          text: '🛒 Welcome to IshyMart Live Support! Hum aapki madad ke liye yahan hain.',
          type: 'text',
          createdAt: new Date(),
        },
      ])
      setJoined(true)
      setJoining(false)
      scrollToBottom()
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    const socket = getSocket()
    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('chat:typing', {
        roomId,
        isTyping: true,
        senderName: session?.user?.name || 'Admin',
      })
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      socket.emit('chat:typing', { roomId, isTyping: false })
    }, 1500)
  }

  const handleSendMessage = () => {
    if (!inputText.trim()) return
    const text = inputText.trim()
    setInputText('')
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    isTypingRef.current = false
    const socket = getSocket()
    socket.emit('chat:typing', { roomId, isTyping: false })
    socket.emit('chat:message', {
      roomId,
      sender: 'admin',
      senderName: session?.user?.name || 'Admin',
      text,
    })
    setMessages((prev) => [
      ...prev,
      {
        sender: 'admin' as const,
        senderName: session?.user?.name || 'Admin',
        text,
        type: 'text',
        createdAt: new Date(),
      },
    ])
    scrollToBottom()
  }

  // FIX 2: Admin file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
        sender: 'admin',
        senderName: session?.user?.name || 'Admin',
        fileName,
        fileUrl,
        fileType,
      })

      setMessages((prev) => [
        ...prev,
        {
          sender: 'admin' as const,
          senderName: session?.user?.name || 'Admin',
          fileName,
          fileUrl,
          fileType,
          type: 'file',
          createdAt: new Date(),
        },
      ])
      scrollToBottom()
    } catch (err) {
      console.error('File upload failed:', err)
      alert('File upload fail ho gayi.')
    } finally {
      setFileUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    const socket = getSocket()
    socket.emit('chat:close', { roomId })
    disconnectSocket()
    router.push('/')
  }

  // File bubble component
  const FileBubble = ({ msg, isAdmin }: { msg: Message; isAdmin: boolean }) => {
    const isImage = msg.fileType?.startsWith('image/')
    return (
      <a
        href={msg.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 max-w-[70%] rounded-2xl px-4 py-3 text-sm hover:opacity-80 transition-opacity ${
          isAdmin
            ? 'bg-gray-800 text-white rounded-br-sm ml-auto'
            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
        }`}
      >
        {isImage ? <ImageIcon className="w-4 h-4 shrink-0" /> : <FileText className="w-4 h-4 shrink-0" />}
        <span className="truncate max-w-[160px] underline underline-offset-2">{msg.fileName}</span>
      </a>
    )
  }

  if (alreadyTaken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center space-y-4">
          <X className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-red-600">Chat Already Taken</h2>
          <p className="text-gray-500 text-sm">Koi aur admin pehle se is customer se baat kar raha hai.</p>
          <button onClick={() => router.push('/')}
            className="bg-gray-800 text-white py-2.5 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-all">
            Dashboard Par Jayein
          </button>
        </div>
      </div>
    )
  }

  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center space-y-5"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Live Chat Join Karein</h2>
            <p className="text-gray-500 text-sm mt-1">Ek customer support ka intezaar kar raha hai</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
            <p className="text-green-700 text-xs font-medium mb-1">Room ID:</p>
            <p className="text-green-800 font-mono text-xs break-all">{roomId}</p>
          </div>
          <p className="text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠️ Agar aap join kar lein toh doosra admin join nahi kar sakega
          </p>
          <button onClick={handleJoin} disabled={joining}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {joining ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>💬 Join Live Chat</>}
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          <div>
            <p className="text-white font-bold">Live Chat — Admin Panel</p>
            <p className="text-gray-400 text-xs">Customer ke saath connected</p>
          </div>
        </div>
        <button onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
          <X className="w-4 h-4" /> Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'file' ? (
              <FileBubble msg={msg} isAdmin={msg.sender === 'admin'} />
            ) : (
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.sender === 'admin'
                  ? 'bg-gray-800 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
              }`}>
                {msg.sender === 'user' && (
                  <p className="text-xs font-semibold text-green-600 mb-0.5">{msg.senderName}</p>
                )}
                <p>{msg.text}</p>
              </div>
            )}
          </div>
        ))}

        {/* FIX 1: User typing dots */}
        <AnimatePresence>
          {userTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center gap-1.5">
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

      {/* FIX 2: File upload button add kiya input mein */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
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
            className="w-11 h-11 border border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:text-green-600 hover:border-green-400 transition-all shrink-0 disabled:opacity-50"
          >
            {fileUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>
          <input
            type="text"
            placeholder="Customer ko message likhein..."
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 border border-gray-300 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white rounded-xl flex items-center gap-2 transition-all font-semibold"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    </div>
  )
}
