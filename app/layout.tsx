import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import GoogleAnalytics from './components/GoogleAnalytics'
import { AuthProvider } from '@/lib/auth-context'
import { CreditsProvider } from '@/lib/credits-context'
import JobPoller from '@/components/JobPoller'
import JobTray from '@/components/JobTray'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = 'https://mymeme.uk'
const siteTitle = 'MyMeme - AI Image Generator & Avatar Creator'
const siteDescription = 'Create stunning AI-generated art, avatars, and images with multiple styles. Turn your photos into cartoons, anime, oil paintings, and more with our AI image generator.'

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  
  // SEO essentials
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  
  // Verification & SEO
  alternates: {
    canonical: siteUrl,
  },
  
  // Open Graph (social sharing)
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: 'MyMeme',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'MyMeme AI Image Generator',
        type: 'image/png',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/twitter-image.png`],
    creator: '@MyMemeAI',
    site: '@MyMemeAI',
  },
  
  // Keywords (important for SEO)
  keywords: [
    'AI image generator',
    'meme maker',
    'avatar generator',
    'AI avatar maker',
    'photo to cartoon',
    'anime avatar generator',
    'character creator',
    'portrait artist AI',
    'digital art generator',
    'AI art generator',
    'face swap online',
    'photo editor AI',
    'cartoon filter',
    'style transfer',
    'caricature generator',
  ],
  
  // Theme color
  themeColor: '#1a3a5e',
  
  // For mobile devices
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  
  // Icons
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  
  // Manifest
  manifest: '/manifest.json',
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'MyMeme',
  'description': 'Free AI image generator for avatars, memes, and artwork',
  'url': 'https://mymeme.uk',
  'applicationCategory': 'GraphicsApplication',
  'operatingSystem': 'Web',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'GBP',
    'description': 'Free to start with credits'
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'ratingCount': '1200'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <GoogleAnalytics />
      </head>
      <body className={`${inter.className} bg-[#0a0a0f] text-white`}>
        <AuthProvider>
          <CreditsProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <JobPoller />
            <JobTray />
            <CookieConsent />
          </CreditsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}