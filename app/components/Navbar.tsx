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
                <span className="text-sm">✨ {credits} credits</span>
                <Link href="/gallery" className="text-dark-blue hover:text-primary-pink">
                  My Gallery 🖼️
                </Link>
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
            <Link href="/create" className="text-dark-blue hover:text-primary-pink transition-colors">
              Create 🖌️
            </Link>
            <Link href="/animate" className="text-dark-blue hover:text-primary-pink transition-colors">
              Animate 🎬
            </Link>
            <Link href="/#pricing" className="text-dark-blue hover:text-primary-pink transition-colors">
              Pricing 💰
            </Link>
            <Link href="/#how-it-works" className="text-dark-blue hover:text-primary-pink transition-colors">
              How It Works 🤔
            </Link>

            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-gradient-to-r from-pink-200 to-pink-300 text-pink-900 px-2 py-1 rounded-full">
                    ✨ {credits} credits
                  </span>
                  <Link href="/gallery" className="text-dark-blue hover:text-primary-pink transition-colors">
                    My Gallery 🖼️
                  </Link>
                  {user.user_metadata?.avatar_url && (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt="User Avatar" 
                      width={32} 
                      height={32} 
                      className="rounded-full"
                    />
                  )}
                  <button 
                    onClick={signOut} 
                    className="bg-primary-pink text-white px-3 py-1 rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
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
              <Link 
                href="/create" 
                className="text-dark-blue hover:bg-bright-yellow block px-3 py-2 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Create 🖌️
              </Link>
              <Link 
                href="/animate" 
                className="text-dark-blue hover:bg-bright-yellow block px-3 py-2 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Animate 🎬
              </Link>
              <Link 
                href="/#pricing" 
                className="text-dark-blue hover:bg-bright-yellow block px-3 py-2 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Pricing 💰
              </Link>
              <Link 
                href="/#how-it-works" 
                className="text-dark-blue hover:bg-bright-yellow block px-3 py-2 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                How It Works 🤔
              </Link>
              
              {user ? (
                <>
                  <div className="flex justify-between items-center px-3 py-2">
                    <span className="text-sm bg-gradient-to-r from-pink-200 to-pink-300 text-pink-900 px-2 py-1 rounded-full">
                      ✨ {credits} credits
                    </span>
                    <button 
                      onClick={() => { signOut(); setIsOpen(false) }} 
                      className="text-dark-blue hover:bg-bright-yellow px-3 py-2 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
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