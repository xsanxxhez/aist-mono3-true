'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/chat')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-8">AIst</h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Ваш персональный AI-ассистент с поддержкой файлов, историей чатов и продвинутыми возможностями
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <button 
            onClick={() => signIn('google', { callbackUrl: '/chat' })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Чат-бот / Войти
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">📁 Загрузка файлов</h3>
            <p className="text-gray-600">Загружайте документы для анализа AI</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">💬 История чатов</h3>
            <p className="text-gray-600">Все ваши беседы сохраняются</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">⚙️ Настройки</h3>
            <p className="text-gray-600">Персонализируйте ваш опыт</p>
          </div>
        </div>
      </div>
    </div>
  )
}
