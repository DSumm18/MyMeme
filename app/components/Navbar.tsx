'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useCredits } from '@/lib/credits-context'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const dropdowns: Record<string, { label: string; href: string; desc: string }[]> = {
  Styles: [
    { label: 'Ghibli', href: '/create?style=ghibli', desc: 'Studio Ghibli anime' },
    { label: 'Cyberpunk Neon', href: '/create?style=cyberpunk-neon', desc: 'Futuristic neon vibes' },
    { label: 'Renaissance', href: '/create?style=renaissance', desc: 'Classical master painting' },
    { label: 'Oil Painting', href: '/create?style=oil-painting', desc: 'Rich textured oils' },
    { label: 'Anime', href: '/create?style=anime', desc: 'Japanese anime style' },
    { label: 'Pixar 3D', href: '/create?style=pixar', desc: 'Animated character' },
    { label: 'GTA V', href: '/create?style=gta', desc: 'Game loading screen' },
    { label: 'Italian Brainrot', href: '/create?style=italian-brainrot', desc: 'Viral meme style' },
    { label: 'View All Styles →', href: '/create', desc: '' },
  ],
  'Use Cases': [
    { label: 'Profile Pictures', href: '/create', desc: 'Stand out on social media' },
    { label: 'Gifts & Prints', href: '/create', desc: 'Custom art for loved ones' },
    { label: 'Content Creation', href: '/create', desc: 'Unique visuals for posts' },
    { label: 'Photo Animation', href: '/animate', desc: 'Bring photos to life' },
    { label: 'Photo Albums', href: '/album', desc: 'Cinematic video albums' },
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
    <nav className="fixed top-0 left-0 w-full z-50 glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-white">MyMeme</span>
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
                <button className="px-3 py-2 text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1">
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
                      className="absolute top-full left-0 mt-1 w-64 glass rounded-xl p-2 shadow-2xl"
                      onMouseEnter={() => handleMouseEnter(key)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors group"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">{item.label}</div>
                          {item.desc && <div className="text-xs text-white/40">{item.desc}</div>}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <Link href="/pricing" className="px-3 py-2 text-sm text-white/70 hover:text-white transition-colors">
              Pricing
            </Link>

            <div className="w-px h-6 bg-white/10 mx-2" />

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/pricing" className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                  ✨ {credits} credits
                </Link>
                <div className="flex items-center gap-2">
                  {user.user_metadata?.avatar_url ? (
                    <Image src={user.user_metadata.avatar_url} alt="Profile" width={32} height={32} className="rounded-full ring-2 ring-purple-500/50" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                      {user.user_metadata?.full_name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <button onClick={signOut} className="text-sm text-white/40 hover:text-white transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors font-medium disabled:opacity-50"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                ✨ {credits}
              </span>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="text-white/70 hover:text-white p-2">
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
            className="md:hidden border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1 bg-[#0a0a0f]/95 backdrop-blur-xl">
              {Object.entries(dropdowns).map(([key, items]) => (
                <div key={key}>
                  <div className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 py-2 mt-2">{key}</div>
                  {items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
              <Link href="/pricing" className="block px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5" onClick={() => setIsOpen(false)}>
                Pricing
              </Link>
              <div className="pt-3 border-t border-white/10">
                {user ? (
                  <button onClick={() => { signOut(); setIsOpen(false) }} className="block w-full text-left px-3 py-2.5 text-sm text-white/50 hover:text-white">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { signIn(); setIsOpen(false) }} className="block w-full px-3 py-2.5 text-sm bg-purple-600 text-white rounded-lg text-center font-medium">
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
