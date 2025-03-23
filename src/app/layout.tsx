import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Collab - Real-Time Code Collaboration',
    template: '%s | Collab'
  },
  description: 'Like Google Docs, but for developers. A seamless, real-time coding platform where you and your team can collaborate instantly.',
  keywords: ['code collaboration', 'real-time coding', 'pair programming', 'developer tools', 'code sharing'],
  authors: [{ name: 'Collab Team' }],
  creator: 'Collab',
  publisher: 'Collab',
  // viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://collab-code.com',
    title: 'Collab - Real-Time Code Collaboration',
    description: 'Like Google Docs, but for developers. A seamless, real-time coding platform where you and your team can collaborate instantly.',
    siteName: 'Collab',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Collab - Real-Time Code Collaboration'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collab - Real-Time Code Collaboration',
    description: 'Like Google Docs, but for developers. A seamless, real-time coding platform where you and your team can collaborate instantly.',
    images: ['/og-image.png']
  },
  icons: {
    icon: [
      { url: '/favicon.svg' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest'
      }
    ]
  },
  metadataBase: new URL('https://collab-code.com'), // Add this line
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}