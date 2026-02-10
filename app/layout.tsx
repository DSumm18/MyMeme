import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MyMeme — Turn Yourself Into a Cartoon',
  description: 'Upload a selfie, enter your job, and watch AI create a fun cartoon caricature of you at work. Share on social media instantly.',
  openGraph: {
    title: 'MyMeme — Turn Yourself Into a Cartoon',
    description: 'Upload a selfie, enter your job, and watch AI create a fun cartoon caricature of you at work. Share on social media instantly.',
    images: ['/og-image.png'], // Create this OG image
    type: 'website',
    url: 'https://mymeme.ai'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyMeme — Turn Yourself Into a Cartoon',
    description: 'Upload a selfie, enter your job, and watch AI create a fun cartoon caricature of you at work. Share on social media instantly.',
    images: ['/og-image.png']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-background min-h-screen`}>
        {children}
        {/* Google Analytics or other analytics placeholder */}
        <script 
          async 
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `
          }}
        />
      </body>
    </html>
  )
}