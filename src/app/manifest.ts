import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

/**
 * Generates the PWA Web App Manifest.
 *
 * Contains metadata for installing the app on the home screen:
 * name, icons, theme/background colors, and display mode (standalone).
 *
 * Next.js serves this file at `/manifest.webmanifest`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zen Workout',
    short_name: 'Workout',
    description: 'Workout tracking app',
    start_url: '/sporttracker/',
    display: 'standalone',
    background_color: '#F3F7F8',
    theme_color: '#F3F7F8',
    icons: [
      {
        src: '/sporttracker/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/sporttracker/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/sporttracker/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
