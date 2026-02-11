import { motion } from 'framer-motion'

export default function SocialProof() {
  return (
    <div className="bg-[#FFF5E1] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center text-center gap-8 md:gap-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <span className="text-4xl">🎨</span>
            <p className="text-xl font-bold text-gray-800">50,000+ Creations</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <span className="text-4xl">⭐</span>
            <p className="text-xl font-bold text-gray-800">4.8 Rating</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col items-center"
          >
            <span className="text-4xl">🌍</span>
            <p className="text-xl font-bold text-gray-800">120+ Countries</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}