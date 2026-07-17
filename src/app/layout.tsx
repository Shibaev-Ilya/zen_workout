import type { Metadata, Viewport } from 'next'
import './globals.scss'

export const metadata: Metadata = {
  title: 'SportTracker — учёт тренировок',
  description: 'Приложение для учёта тренировок с таймером и историей',
  manifest: '/sporttracker/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SportTracker',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="apple-touch-icon" href="/sporttracker/icon-192x192.png" />
      </head>
      <body className="min-h-dvh flex flex-col">
        {children}
      </body>
    </html>
  )
}