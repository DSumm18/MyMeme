'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useCredits } from '@/lib/credits-context'
import Image from 'next/image'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading, signIn, signOut } = useAuth()
  const { credits } = useCredits()

  const navLinks = [
    { href: "/create", label: "Transform", emoji: "🎨" },
    { href: "/animate", label: "Animate", emoji: "🎬" },
    { href: "/album", label: "Albums", emoji: "📸" },
    { href: "/#pricing", label: "Pricing", emoji: "💰" },
    { href: "/gallery", label: "Gallery", emoji: "🖼️" },
  ]

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-pink">🎨 MyMeme</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm bg-gradient-to-r from-pink-200 to-pink-300 text-pink-900 px-2 py-1 rounded-full">✨ {credits}</span>
                {user.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="Profile" width={28} height={28} className="rounded-full border-2 border-pink-300" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary-pink text-white flex items-center justify-center text-xs font-bold">
                    {user.user_metadata?.full_name?.[0] || '?'}
                  </div>
                )}
              </div>
            ) : null}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-dark-blue hover:text-primary-pink focus:outline-none"
            >
              {isOpen ? '✖️' : '🍔'}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-dark-blue hover:text-primary-pink transition-colors flex items-center gap-1"
              >
                {link.emoji} {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center space-x-3">
                <Link href="/pricing" className="text-sm bg-gradient-to-r from-pink-200 to-pink-300 text-pink-900 px-3 py-1 rounded-full hover:scale-105 transition-transform">
                  ✨ {credits} credits
                </Link>
                <div className="flex items-center space-x-2 bg-gray-50 rounded-full pl-3 pr-1 py-1">
                  <span className="text-sm font-medium text-gray-700">
                    Hi {user.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋
                  </span>
                  {user.user_metadata?.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      width={32} 
                      height={32} 
                      className="rounded-full border-2 border-pink-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-pink text-white flex items-center justify-center text-sm font-bold">
                      {user.user_metadata?.full_name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <button 
                  onClick={signOut} 
                  className="text-sm text-gray-500 hover:text-primary-pink transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={signIn} 
                disabled={loading}
                className="bg-primary-pink text-white px-3 py-1 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Sign In'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-dark-blue hover:bg-bright-yellow block px-3 py-2 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {link.emoji} {link.label}
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-gray-700">
                    Hi {user.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋
                  </div>
                  <Link href="/pricing" className="block px-3 py-2" onClick={() => setIsOpen(false)}>
                    <span className="text-sm bg-gradient-to-r from-pink-200 to-pink-300 text-pink-900 px-2 py-1 rounded-full">
                      ✨ {credits} credits — Get More
                    </span>
                  </Link>
                  <button 
                    onClick={() => { signOut(); setIsOpen(false) }} 
                    className="text-gray-500 hover:bg-bright-yellow block w-full text-left px-3 py-2 rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { signIn(); setIsOpen(false) }} 
                  disabled={loading}
                  className="bg-primary-pink text-white px-3 py-2 rounded-lg w-full hover:bg-pink-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Sign In'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}