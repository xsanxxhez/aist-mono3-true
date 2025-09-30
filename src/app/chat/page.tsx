'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  html?: string // HTML версия сообщения для markdown
}

type FileContext = {
  content: string
  filename: string
  fileType: string
}

// SVG иконки (замена для lucide-react)
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
  </svg>
)

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
)

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
)

const FileIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
)

const LoadingSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
  </svg>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [fileContext, setFileContext] = useState<FileContext | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          chatId: chatId,
          fileContext: fileContext?.content
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка API')
      }

      const data = await response.json()
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.message,
        html: data.messageHtml, // HTML версия для markdown
        timestamp: new Date()
      }])

      if (data.chatId && !chatId) {
        setChatId(data.chatId)
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    console.log('Загрузка файла:', file.name)
    setIsLoading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('chatId', chatId || 'temp')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка загрузки')
      }

      const data = await response.json()

      setFileContext({
        content: data.file.content,
        filename: data.file.originalName,
        fileType: data.file.mimeType
      })

      // Добавляем сообщение о загруженном файле
      const fileMessage: Message = {
        role: 'user',
        content: `📎 Загружен файл: ${data.file.originalName}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fileMessage])

    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert(`Ошибка при загрузке файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const clearFileContext = () => {
    setFileContext(null)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') return '📕'
    if (fileType.includes('word')) return '📘'
    if (fileType.includes('image')) return '🖼️'
    return '📄'
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-light">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-white">/AIST</h1>
            </div>

            {fileContext && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                <span className="text-sm">{getFileIcon(fileContext.fileType)}</span>
                <span className="text-white text-sm font-medium max-w-xs truncate">
                  {fileContext.filename}
                </span>
                <button
                  onClick={clearFileContext}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={session.user?.image || ''}
                alt="Profile"
                className="w-8 h-8 rounded-full border-2 border-white/20"
              />
              <span className="text-white text-sm font-medium hidden sm:block">
                {session.user?.name}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              title="Выйти"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto p-6 transition-all duration-200 ${
            isDragging ? 'bg-blue-500/10 border-2 border-dashed border-blue-400' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-white/60 mt-20 space-y-6">
                <div className="w-24 h-24 mx-auto bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                  <FileIcon />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-light text-white">Добро пожаловать в /AIST</h2>
                  <p className="text-lg">Задайте вопрос или загрузите файл для начала работы</p>
                  <div className="flex justify-center gap-4 pt-4">
                    <div className="text-sm bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                      📄 PDF, Word, Текст
                    </div>
                    <div className="text-sm bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                      🖼️ Изображения
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700'
                  }`}>
                    {message.role === 'user' ? (
                      <UserIcon />
                    ) : (
                      <div className="w-3 h-3 bg-white rounded-sm"></div>
                    )}
                  </div>

                  {/* Message */}
                  <div className={`flex flex-col gap-2 max-w-[70%] ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-white/10 text-white backdrop-blur-xl border border-white/20'
                    }`}>
                      {message.html ? (
                        <div
                          className="prose prose-invert max-w-none break-words"
                          dangerouslySetInnerHTML={{ __html: message.html }}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-white/40 px-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <div className="max-w-4xl mx-auto">
            {/* File Context Bar */}
            {fileContext && (
              <div className="flex items-center justify-between mb-4 p-3 bg-white/10 rounded-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm">{getFileIcon(fileContext.fileType)}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{fileContext.filename}</p>
                    <p className="text-white/40 text-xs">Файл загружен</p>
                  </div>
                </div>
                <button
                  onClick={clearFileContext}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="hidden"
                accept=".txt,.md,.json,.pdf,.doc,.docx,image/*"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                <UploadIcon />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Введите ваш вопрос..."
                  className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 pr-12 text-black placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 backdrop-blur-xl"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl flex items-center justify-center text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <SendIcon />
                )}
              </button>
            </form>

            {/* Drag & Drop Hint */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center pointer-events-none">
                <div className="text-center text-blue-400">
                  <UploadIcon />
                  <p className="text-lg font-medium">Отпустите файл для загрузки</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}