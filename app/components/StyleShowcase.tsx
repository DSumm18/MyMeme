'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

const styles = [
  { name: 'Anime', emoji: '⚡', color: 'bg-purple-500' },
  { name: 'Pixar', emoji: '✨', color: 'bg-teal-500' },
  { name: 'Caricature', emoji: '🎨', color: 'bg-pink-500' },
  { name: 'GTA', emoji: '🔫', color: 'bg-indigo-900' },
  { name: 'Superhero', emoji: '🦸', color: 'bg-red-500' },
  { name: 'Claymation', emoji: '🧊', color: 'bg-orange-500' },
  { name: 'Simpsons', emoji: '🟡', color: 'bg-yellow-500' },
  { name: 'Oil Painting', emoji: '🖼️', color: 'bg-brown-500' }
]

export default function StyleShowcase() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Art Styles</h2>
      
      <div className="grid md:grid-cols-4 gap-6">
        {styles.map((style, index) => (
          <Link href={`/create?style=${style.name.toLowerCase()}`} key={index}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${style.color} rounded-xl p-6 text-center text-white shadow-md cursor-pointer`}
            >
              <div className="text-5xl mb-4">{style.emoji}</div>
              <h3 className="text-xl font-bold">{style.name}</h3>
            </motion.div>
          </Link>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Link href="/create" className="text-[#FF6B9D] hover:underline">
          See All 16 Styles →
        </Link>
      </div>
    </div>
  )
}