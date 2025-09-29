'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type FileContext = {
  content: string
  filename: string
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [fileContext, setFileContext] = useState<FileContext | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    console.log('💬 [UI] Отправка сообщения:', {
      input,
      fileContext: fileContext ? {
        filename: fileContext.filename,
        contentLength: fileContext.content.length,
        contentPreview: fileContext.content.substring(0, 100)
      } : 'отсутствует'
    });

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
      setMessages([...newMessages, { role: 'assistant', content: data.message }])
      
      if (data.chatId && !chatId) {
        setChatId(data.chatId)
      }
    } catch (error) {
      console.error('❌ [UI] Ошибка:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('📁 [UI] Начало загрузки файла:', file.name, file.type, file.size);

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
      console.log('✅ [UI] Файл загружен, ответ:', data);
      
      // Сохраняем контекст файла
      setFileContext({
        content: data.file.content,
        filename: data.file.originalName
      });

      console.log('💾 [UI] FileContext установлен:', {
        filename: data.file.originalName,
        contentLength: data.file.content.length,
        contentPreview: data.file.content.substring(0, 100)
      });

      // Добавляем сообщение о загруженном файле
      const fileMessage: Message = { 
        role: 'user', 
        content: `Загружен файл: ${data.file.originalName}\n\nСодержимое файла:\n${data.file.content.substring(0, 500)}${data.file.content.length > 500 ? '...' : ''}` 
      };
      setMessages(prev => [...prev, fileMessage]);
      
      alert(`Файл "${data.file.originalName}" успешно загружен! Теперь AI будет учитывать его содержимое.`);
    } catch (error) {
      console.error('❌ [UI] Ошибка загрузки:', error)
      alert(`Ошибка при загрузке файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  const clearFileContext = () => {
    setFileContext(null);
    alert('Контекст файла очищен');
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">AIst Chat</h1>
          <div className="flex items-center gap-4">
            {fileContext && (
              <div className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                📁 {fileContext.filename}
              </div>
            )}
            <span className="text-sm text-gray-600">Привет, {session.user?.name}!</span>
            <img 
              src={session.user?.image || ''} 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
            <button 
              onClick={() => signOut()}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="text-2xl mb-2">👋</div>
                  <p>Задайте ваш первый вопрос AI-ассистенту!</p>
                  <p className="text-sm mt-2">Или загрузите файл для анализа</p>
                  {fileContext && (
                    <div className="mt-4 p-2 bg-blue-50 rounded">
                      <p className="text-blue-800">📁 Активный файл: {fileContext.filename}</p>
                      <button 
                        onClick={clearFileContext}
                        className="text-sm text-blue-600 underline mt-1"
                      >
                        Очистить контекст
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex gap-2 mb-2">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="border rounded-lg px-4 py-2 flex-1"
                  accept=".txt,.md,.json,.csv"
                />
                {fileContext && (
                  <button
                    type="button"
                    onClick={clearFileContext}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Очистить файл
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Введите ваш вопрос..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '...' : 'Отправить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
