import type { Metadata, Viewport } from 'next'
import { ActiveTrainingFab } from '@/components/active-training-fab'
import { InstallPrompt } from '@/components/install-prompt'
import { PageTransition } from '@/components/page-transition'
import './globals.scss'

export const metadata: Metadata = {
  title: 'Zen Workout — workout tracker',
  description: 'Workout tracking app',
  manifest: '/sporttracker/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Zen Workout',
  },
  icons: {
    icon: [
      { url: '/sporttracker/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/sporttracker/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/sporttracker/icon.png', type: 'image/png' },
    ],
    // iOS игнорирует manifest icons; нужен apple-touch-icon 180×180 без прозрачности
    apple: [{ url: '/sporttracker/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F3F7F8',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col">
        <PageTransition>{children}</PageTransition>
        <ActiveTrainingFab />
        <InstallPrompt />
      </body>
    </html>
  )
}