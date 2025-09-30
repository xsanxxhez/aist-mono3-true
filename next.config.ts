import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
// Включаем экспериментальные фичи для лучшей совместимости
experimental: {
serverComponentsExternalPackages: ['mammoth', 'pdf-parse'],
},

// Настройки API routes
api: {
bodyParser: {
sizeLimit: '10mb', // Увеличиваем лимит для загрузки файлов
},
responseLimit: '10mb',
},

// Настройки Server Actions
serverActions: {
bodySizeLimit: '10mb',
},

// Отключаем strict mode для избежания двойного рендеринга в development
reactStrictMode: false,

// Настройки для работы с файлами
webpack: (config, { isServer }) => {
    // Для обработки бинарных файлов (PDF, Word)
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },

  // Настройки для production
  compiler: {
    // Включаем удаление console.log в production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Настройки для работы с внешними доменами (если нужно)
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google avatars
      'avatars.githubusercontent.com', // GitHub avatars
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },

  // Environment variables доступные на клиенте
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Настройки для TypeScript
  typescript: {
    // В production пропускаем проверку типов для скорости билда
    ignoreBuildErrors: false,
  },

  // Настройки для ESLint
  eslint: {
    // В production пропускаем проверку ESLint для скорости билда
    ignoreDuringBuilds: false,
  },

  // Настройки headers для API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },

  // Настройки для trailing slashes
  trailingSlash: false,

  // Настройки для production optimizations
  poweredByHeader: false,

  // Настройки compression
  compress: true,
}

export default nextConfig