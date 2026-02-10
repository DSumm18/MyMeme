'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-pink">🎨 MyMeme</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-dark-blue hover:text-primary-pink focus:outline-none"
            >
              {isOpen ? '✖️' : '🍔'}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Link href="/create" className="text-dark-blue hover:text-primary-pink transition-colors">
              Create 🖌️
            </Link>
            <Link href="/#pricing" className="text-dark-blue hover:text-primary-pink transition-colors">
              Pricing 💰
            </Link>
            <Link href="/#how-it-works" className="text-dark-blue hover:text-primary-pink transition-colors">
              How It Works 🤔
            </Link>
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
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}