import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

/**
 * Генерирует PWA Web App Manifest.
 *
 * Содержит метаданные для установки приложения на домашний экран:
 * название, иконки, цвета темы и фона, режим отображения (standalone).
 *
 * Next.js автоматически отдаёт этот файл по пути `/manifest.webmanifest`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SportTracker',
    short_name: 'SportTracker',
    description: 'Приложение для учёта тренировок',
    start_url: '/sporttracker/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}