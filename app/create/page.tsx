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
      const img = new Image()
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
      img.onerror = reject
      img.src = event.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Rest of the component remains the same as before, with modified handleImageUpload
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

  // Styles array remains the same as before...

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

  // Main component render logic
  return (
    <>
      {loading && (
        <LoadingOverlay 
          onCancel={() => setLoading(false)} 
          currentPhrase={currentPhrase}
          currentEmoji={currentEmoji}
        />
      )}
      <main className="p-8">
        {/* Existing component render content */}
      </main>
    </>
  )
}
}