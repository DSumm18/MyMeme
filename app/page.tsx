'use client'

import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import StyleShowcase from './components/StyleShowcase'
import BeforeAfterShowcase from './components/BeforeAfterShowcase'
import SocialProof from './components/SocialProof'
import Pricing from './components/Pricing'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <StyleShowcase />
      <BeforeAfterShowcase />
      <SocialProof />
      <Pricing />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full py-16 bg-gradient-to-br from-[#6BCB77] to-[#FF6B9D] text-center text-white"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform?
          </h2>
          
          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#FF6B9D] font-bold py-3 px-6 rounded-full text-xl shadow-lg hover:shadow-xl transition-all"
            >
              Create My Meme 🎨
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </main>
  )
}