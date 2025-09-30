import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
// Внешние пакеты для server components
serverExternalPackages: ['mammoth', 'pdf-parse', '@prisma/client'],

// Экспериментальные фичи
experimental: {
serverActions: {
bodySizeLimit: '10mb',
},
},

// Отключаем strict mode
reactStrictMode: false,

// Настройки для работы с файлами
webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    return config;
  },

  // Настройки для production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Настройки для изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },

  // Настройки для TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Настройки для ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Настройки headers
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

  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
}

export default nextConfig