'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useCredits } from '@/lib/credits-context'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const dropdowns: Record<string, { label: string; href: string; desc: string }[]> = {
  Styles: [
    { label: '🌸 Ghibli', href: '/styles/ghibli', desc: 'Studio Ghibli anime' },
    { label: '🌃 Cyberpunk Neon', href: '/styles/cyberpunk-neon', desc: 'Futuristic neon vibes' },
    { label: '🏛️ Renaissance', href: '/styles/renaissance', desc: 'Classical master painting' },
    { label: '🖼️ Oil Painting', href: '/styles/oil-painting', desc: 'Rich textured oils' },
    { label: '⚡ Anime', href: '/styles/anime', desc: 'Japanese anime style' },
    { label: '✨ Pixar 3D', href: '/styles/pixar', desc: 'Animated character' },
    { label: '🔫 GTA V', href: '/styles/gta', desc: 'Game loading screen' },
    { label: '🤌 Italian Brainrot', href: '/styles/italian-brainrot', desc: 'Viral meme style' },
    { label: 'View All Styles →', href: '/create', desc: '' },
  ],
  Products: [
    { label: '🎨 Photo Styles', href: '/create', desc: '15+ AI art transformations' },
    { label: '🎬 Photo Animation', href: '/animate', desc: 'Bring photos to life' },
    { label: '📸 Photo Albums', href: '/album', desc: 'Cinematic video albums' },
  ],
  Learn: [
    { label: 'FAQ', href: '/#faq', desc: 'Common questions' },
    { label: 'Gallery', href: '/gallery', desc: 'Community creations' },
  ],
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { user, loading, signIn, signOut } = useAuth()
  const { credits } = useCredits()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleMouseEnter = (key: string) => {
    clearTimeout(timeoutRef.current)
    setActiveDropdown(key)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 200)
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="text-xl font-black text-gray-900">MyMeme</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1" ref={dropdownRef}>
            {Object.entries(dropdowns).map(([key, items]) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => handleMouseEnter(key)}
                onMouseLeave={handleMouseLeave}
              >
                <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 font-medium">
                  {key}
                  <svg className={`w-3 h-3 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {activeDropdown === key && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl p-2 shadow-xl border border-gray-100"
                      onMouseEnter={() => handleMouseEnter(key)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="text-sm font-medium text-gray-900 group-hover:text-[#FF90E8] transition-colors">{item.label}</div>
                          {item.desc && <div className="text-xs text-gray-400">{item.desc}</div>}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <Link href="/pricing" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Pricing
            </Link>

            <div className="w-px h-6 bg-gray-200 mx-2" />

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/pricing" className="text-sm bg-[#FF90E8]/10 text-[#FF90E8] px-3 py-1.5 rounded-full border border-[#FF90E8]/20 hover:bg-[#FF90E8]/20 transition-colors font-bold">
                  ✨ {credits} credits
                </Link>
                <div className="flex items-center gap-2">
                  {user.user_metadata?.avatar_url ? (
                    <Image src={user.user_metadata.avatar_url} alt="Profile" width={32} height={32} className="rounded-full ring-2 ring-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-sm font-bold text-white">
                      {user.user_metadata?.full_name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <button onClick={signOut} className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-bold disabled:opacity-50"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <span className="text-xs bg-[#FF90E8]/10 text-[#FF90E8] px-2 py-1 rounded-full border border-[#FF90E8]/20 font-bold">
                ✨ {credits}
              </span>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-900 p-2">
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1 bg-white/95 backdrop-blur-xl">
              {Object.entries(dropdowns).map(([key, items]) => (
                <div key={key}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mt-2">{key}</div>
                  {items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
              <Link href="/pricing" className="block px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
                Pricing
              </Link>
              <div className="pt-3 border-t border-gray-100">
                {user ? (
                  <button onClick={() => { signOut(); setIsOpen(false) }} className="block w-full text-left px-3 py-2.5 text-sm text-gray-400 hover:text-gray-900">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { signIn(); setIsOpen(false) }} className="block w-full px-3 py-2.5 text-sm bg-gray-900 text-white rounded-lg text-center font-bold">
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
