import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { SkipLink } from '@/components/Accessibility'

export const metadata: Metadata = {
  title: 'Pocket Symptom Tracker',
  description: 'Privacy-first symptom tracking for chronic conditions',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Symptom Tracker',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// Script to apply theme before React hydration to prevent flash
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme') || 'system';
      var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
