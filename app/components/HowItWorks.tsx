'use client'
import { motion } from 'framer-motion'

const steps = [
  { icon: '📸', title: 'Upload Your Photo', description: 'Choose a selfie from your device' },
  { icon: '🎨', title: 'Pick Your Style', description: 'Select from 16 unique art styles' },
  { icon: '✨', title: 'Download & Share', description: 'Save and share your transformed pic' }
]

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className="bg-[#FFF5E1] rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all"
          >
            <div className="text-6xl mb-4">{step.icon}</div>
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}