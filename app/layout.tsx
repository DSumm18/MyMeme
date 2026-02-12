import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AuthProvider } from '@/lib/auth-context'
import JobPoller from '@/components/JobPoller'
import JobTray from '@/components/JobTray'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MyMeme - AI Caricature Generator',
  description: 'Transform your work selfie into a hilarious cartoon caricature!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-dark-blue`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <JobPoller />
          <JobTray />
        </AuthProvider>
      </body>
    </html>
  )
}