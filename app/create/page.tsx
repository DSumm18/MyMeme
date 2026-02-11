'use client'

import { useState, useRef, useEffect } from 'react'
import { loadingPhrases } from './LoadingPhrases'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Loading emojis for animation
const LOADING_EMOJIS = ['🎨', '🖌️', '✨', '🎭', '🖼️']

const LoadingOverlay = ({ 
  onCancel, 
  currentPhrase, 
  currentEmoji 
}: { 
  onCancel: () => void, 
  currentPhrase: string, 
  currentEmoji: string 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white max-w-md rounded-2xl p-8 text-center">
        {/* Emoji Animation */}
        <div 
          key={currentEmoji} 
          className="text-6xl mb-4 animate-spin-slow animate-pulse-scale"
        >
          {currentEmoji}
        </div>

        {/* Rotating Phrases */}
        <p 
          key={currentPhrase} 
          className="text-lg mb-4 animate-fade-in-out"
        >
          {currentPhrase}
        </p>

        {/* Progress Indication */}
        <p className="text-sm text-gray-500 mb-4">
          Usually takes about 15 seconds
        </p>

        {/* Cancel Button */}
        <button 
          onClick={onCancel} 
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// New utility function for image compression and resizing
function compressImage(file: File, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Resize maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxWidth) {
            width *= maxWidth / height
            height = maxWidth
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // Compress to JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = event.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function CreatePage() {
  const router = useRouter()
  const [selectedStyle, setSelectedStyle] = useState('caricature')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [accessories, setAccessories] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPhrase, setCurrentPhrase] = useState(loadingPhrases[0])
  const [currentEmoji, setCurrentEmoji] = useState(LOADING_EMOJIS[0])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const styles = [
    { id: 'caricature', name: 'Caricature', emoji: '🎨', bg: 'bg-pink-100', description: 'Big head, big personality!' },
    { id: 'watercolor', name: 'Watercolor', emoji: '🖌️', bg: 'bg-blue-100', description: 'Soft artistic portrait!' },
    { id: 'anime', name: 'Anime', emoji: '⚡', bg: 'bg-purple-100', description: 'Kawaii cartoon style!' },
    { id: 'pop-art', name: 'Pop Art', emoji: '💥', bg: 'bg-yellow-100', description: 'Bold comic book vibes!' },
    { id: 'clay-3d', name: 'Claymation', emoji: '🧊', bg: 'bg-orange-100', description: 'Sculpted clay figure look!' },
    { id: 'superhero', name: 'Superhero', emoji: '🦸', bg: 'bg-red-100', description: 'Comic book hero pose!' },
    { id: 'renaissance', name: 'Oil Painting', emoji: '🖼️', bg: 'bg-brown-100', description: 'Classic masterpiece style!' },
    { id: 'pencil-sketch', name: 'Pencil Sketch', emoji: '✏️', bg: 'bg-gray-100', description: 'Hand-drawn artistry!' },
    { id: 'pixar', name: 'Pixar', emoji: '✨', bg: 'bg-teal-100', description: 'Animated character magic!' },
    { id: 'retro-80s', name: 'Retro 80s', emoji: '🕹️', bg: 'bg-pink-200', description: 'Synthwave nostalgia!' },
    { id: 'comic-book', name: 'Comic Book', emoji: '💬', bg: 'bg-green-100', description: 'Comic book style!' },
    { id: 'sticker', name: 'Sticker', emoji: '🏷️', bg: 'bg-mint-100', description: 'Die-cut cool vibes!' },
    { id: 'lego', name: 'Lego', emoji: '🧱', bg: 'bg-yellow-100', description: 'Blocky toy character!' },
    { id: 'gta', name: 'GTA Style', emoji: '🔫', bg: 'bg-purple-200', description: 'Video game loading screen!' },
    { id: 'simpsons', name: 'Simpsons', emoji: '🟡', bg: 'bg-yellow-100', description: 'Yellow cartoon character!' },
    { id: 'minecraft', name: 'Minecraft', emoji: '⛏️', bg: 'bg-brown-100', description: 'Pixelated block world!' }
  ]

  // Manage loading phrase and emoji rotation
  useEffect(() => {
    if (!loading) return

    // Phrase rotation
    const phraseInterval = setInterval(() => {
      const randomPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]
      setCurrentPhrase(randomPhrase)
    }, 2500)

    // Emoji rotation
    const emojiInterval = setInterval(() => {
      const randomEmoji = LOADING_EMOJIS[Math.floor(Math.random() * LOADING_EMOJIS.length)]
      setCurrentEmoji(randomEmoji)
    }, 2000)

    // Cleanup intervals when loading is false
    return () => {
      clearInterval(phraseInterval)
      clearInterval(emojiInterval)
    }
  }, [loading])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image too large. Max 10MB.')
        return
      }
      try {
        // Compress image to max 1024px, 80% quality JPEG
        const compressedImage = await compressImage(file, 1024, 0.8)
        setSelectedImage(compressedImage)
        setError('')
      } catch (err) {
        setError('Image compression failed. Please try another image.')
      }
    }
  }

  const handleGenerate = async () => {
    if (!selectedImage) {
      setError('Please upload a selfie!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          style: selectedStyle,
          jobTitle,
          accessories,
          location,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      // Store result in sessionStorage and the original image
      sessionStorage.setItem('mymeme_original', selectedImage)
      sessionStorage.setItem('mymeme_result', JSON.stringify({
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        cost: data.cost,
        style: selectedStyle,
        jobTitle,
      }))
      router.push('/result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && (
        <LoadingOverlay 
          onCancel={() => setLoading(false)} 
          currentPhrase={currentPhrase}
          currentEmoji={currentEmoji}
        />
      )}
      <div className="min-h-screen bg-gradient-to-b from-white to-[#FFF5E1] py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black text-center mb-2" style={{ color: '#1A1A2E' }}>
            Create Your Meme 🎨
          </h1>
          <p className="text-center text-gray-500 mb-12">Three simple steps. Takes 10 seconds.</p>

          {/* Step 1: Upload */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
              <span className="bg-[#FF6B9D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">1</span>
              Upload Your Selfie
            </h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#FF6B9D] rounded-2xl p-8 text-center cursor-pointer hover:bg-[#FF6B9D]/5 transition-colors"
            >
              {selectedImage ? (
                <div className="relative w-48 h-48 mx-auto">
                  <Image src={selectedImage} alt="Your selfie" fill className="rounded-xl object-cover" />
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-3">📸</div>
                  <p className="text-gray-500">Click to upload or drag & drop</p>
                  <p className="text-sm text-gray-400 mt-1">JPG, PNG — max 10MB</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>
          </div>

          {/* Step 2: Style */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
              <span className="bg-[#6BCB77] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">2</span>
              Pick Your Style
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {styles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedStyle === style.id
                      ? 'ring-4 ring-[#FF6B9D] scale-105 shadow-lg'
                      : 'hover:shadow-md hover:scale-102'
                  }`}
                >
                  <div className={`aspect-square flex items-center justify-center text-6xl ${style.bg}`}>
                    {style.emoji}
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="font-bold text-sm">{style.name}</h3>
                    <p className="text-xs text-gray-500">{style.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Details */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
              <span className="bg-[#FFD93D] text-[#1A1A2E] w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">3</span>
              Optional Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Job Title (optional)</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Nurse, Teacher, Chef, Software Engineer"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B9D] transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700">Accessories (optional)</label>
                  <input
                    type="text"
                    value={accessories}
                    onChange={(e) => setAccessories(e.target.value)}
                    placeholder="e.g. stethoscope, coffee mug"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B9D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700">Location / Scene (optional)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. hospital ward, office desk"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B9D]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedImage}
              className={`px-12 py-4 text-xl rounded-full font-black transition-all duration-300 ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                  : selectedImage
                  ? 'bg-[#FF6B9D] text-white hover:scale-105 hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Creating Your Meme...' : 'Create My Meme 🎨'}
            </button>
            {!loading && <p className="text-sm text-gray-400 mt-3">Free • No account needed • 10 seconds</p>}
          </div>
        </div>
      </div>
    </>
  )
}