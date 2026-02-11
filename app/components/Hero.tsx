import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-16 bg-gradient-to-br from-[#FF6B9D] to-[#6BCB77] text-center text-white"
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Turn Your Selfie into Art in Seconds
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          AI-powered photo transformation. 16 styles. One click. Pure magic.
        </p>
        
        <Link href="/create">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-[#FF6B9D] font-bold py-3 px-6 rounded-full text-xl shadow-lg hover:shadow-xl transition-all"
          >
            Transform My Photo — Free ✨
          </motion.button>
        </Link>
        
        <p className="mt-4 text-sm opacity-80">
          No signup needed • Takes 10 seconds • First 3 free
        </p>
      </div>
    </motion.div>
  )
}