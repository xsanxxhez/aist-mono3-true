'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    if (session) {
      router.push('/chat')
    }
    setIsVisible(true)
  }, [session, router])

  const features = [
    {
      icon: '🤝',
      title: 'Помощь в адаптации',
      description: 'Помогаем иностранцам освоиться в Беларуси: документы, культура, традиции'
    },
    {
      icon: '🏛️',
      title: 'Госуслуги',
      description: 'Консультации по государственным услугам и бюрократическим процедурам'
    },
    {
      icon: '🏥',
      title: 'Медицина',
      description: 'Информация о системе здравоохранения и медицинских услугах'
    },
    {
      icon: '🎓',
      title: 'Образование',
      description: 'Помощь с образовательными учреждениями и процессами'
    },
    {
      icon: '💼',
      title: 'Бизнес',
      description: 'Поддержка бизнес-процессов и предпринимательства'
    },
    {
      icon: '🚀',
      title: 'AI Технологии',
      description: 'Современные AI-решения для ваших задач'
    }
  ]

  const services = [
    {
      title: 'AI-Автоматизация',
      description: 'Внедряем AI-решения для автоматизации бизнес-процессов',
      features: ['Чат-боты', 'Обработка документов', 'Аналитика данных']
    },
    {
      title: 'Разработка ПО',
      description: 'Создаем современные веб и мобильные приложения',
      features: ['Full-stack разработка', 'Cloud решения', 'Интеграции API']
    },
    {
      title: 'Консалтинг',
      description: 'Помогаем внедрить технологии в ваш бизнес',
      features: ['Технический аудит', 'Стратегия развития', 'Обучение']
    }
  ]

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-500 animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Главный контент */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Хедер */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex justify-center mb-6">

          </div>

          <h1 className="text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow">
            /AIST
          </h1>

          <p className="text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Ваш AI-помощник для <span className="text-blue-300 font-semibold">Беларуси</span>
          </p>

          <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12">
            <p className="text-lg text-white/70 leading-relaxed">
              <span className="text-blue-300 font-semibold">AIST</span> - это инновационный ассистент, разработанный специально для помощи иностранцам в адаптации к жизни в Беларуси.
              От документов и медицины до культуры и бизнеса - мы поможем на каждом этапе.
            </p>
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-200 text-sm">
                🚧 <strong>Демо-версия:</strong> Проект активно развивается. Скоро - новые функции и возможности!
              </p>
            </div>
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/chat' })}
            className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 rounded-2xl text-xl font-semibold transition-all duration-300 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
          >
            <span className="relative z-10">🚀 Начать общение с AIST</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </div>

        {/* Возможности */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Что сможет AIST?</h2>
          <p className="text-xl text-white/60 text-center mb-12 max-w-2xl mx-auto">
            Комплексная помощь по всем аспектам жизни в Беларуси
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 ${
                  hoveredCard === index ? 'transform scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Коммерческие услуги */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Коммерческие услуги</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Компания <span className="text-blue-300 font-semibold">/AIST</span> готова взять на себя проекты по AI-автоматизации и разработке ПО
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {index === 0 ? '🤖' : index === 1 ? '💻' : '🎯'}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-white/60 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-white/70 flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-4 bg-black/20 border border-white/10 rounded-2xl px-6 py-4">
              <span className="text-green-400 text-2xl">💼</span>
              <div className="text-left">
                <p className="text-white font-semibold">Готовы к сотрудничеству!</p>
                <p className="text-white/60 text-sm">Обсудим ваш проект и предложим решение</p>
              </div>
            </div>
          </div>
        </div>

        {/* Технологии */}
        <div className="text-center">


        </div>

        {/* Футер */}
        <footer className="text-center mt-20 pt-8 border-t border-white/10">
          <p className="text-white/40">
            © 2024 /AIST - AI Assistant for Belarus. Демо-версия
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}