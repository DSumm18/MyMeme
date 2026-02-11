import { motion } from 'framer-motion'

const transformations = [
  { 
    original: 'bg-gray-200', 
    transformed: 'bg-purple-500', 
    style: 'Caricature', 
    emoji: '🎨' 
  },
  { 
    original: 'bg-gray-200', 
    transformed: 'bg-teal-500', 
    style: 'Anime', 
    emoji: '⚡' 
  },
  { 
    original: 'bg-gray-200', 
    transformed: 'bg-indigo-900', 
    style: 'GTA', 
    emoji: '🔫' 
  }
]

export default function BeforeAfterShowcase() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Transformation Magic</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {transformations.map((transformation, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 bg-white rounded-xl shadow-lg p-6"
          >
            <div className={`w-40 h-40 ${transformation.original} rounded-lg flex items-center justify-center`}>
              <span className="text-5xl">📷</span>
              <p className="text-sm absolute mt-32 text-gray-600">Original</p>
            </div>
            
            <div className="text-3xl mx-4">→</div>
            
            <div className={`w-40 h-40 ${transformation.transformed} rounded-lg flex items-center justify-center`}>
              <span className="text-5xl">{transformation.emoji}</span>
              <p className="text-sm absolute mt-32 text-white">{transformation.style}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <p className="text-center text-sm text-gray-600 mt-6">
        Results may vary based on photo quality
      </p>
    </div>
  )
}