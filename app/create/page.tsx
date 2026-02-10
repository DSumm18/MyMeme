'use client'

import { useState } from 'react'
import ImageUploader from '../components/ImageUploader'
import StyleSelector from '../components/StyleSelector'
import LoadingOverlay from '../components/LoadingOverlay'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const [image, setImage] = useState<File | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [gender, setGender] = useState('')
  const [style, setStyle] = useState('caricature')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!image || !jobTitle) {
      alert('Please upload an image and enter your job title')
      return
    }

    setIsLoading(true)

    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.readAsDataURL(image)
      reader.onloadend = async () => {
        const base64Image = reader.result as string

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: base64Image,
            jobTitle,
            gender,
            style
          })
        })

        if (!response.ok) {
          throw new Error('Image generation failed')
        }

        const data = await response.json()
        setGeneratedImage(data.imageUrl)
        router.push(`/result?imageUrl=${encodeURIComponent(data.imageUrl)}`)
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-purple-50 py-16">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-600">
          Create Your Cartoon Caricature
        </h1>

        <ImageUploader 
          onImageUpload={(file) => setImage(file)}
        />

        <div className="space-y-6">
          <div>
            <label htmlFor="jobTitle" className="block text-lg font-semibold text-purple-600 mb-2">
              What's your job?
            </label>
            <input 
              type="text" 
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Teacher, Nurse, Designer" 
              className="w-full px-4 py-3 rounded-lg border border-purple-600/20 focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-purple-600 mb-2">
              Gender
            </label>
            <div className="flex space-x-4">
              {['Male', 'Female', 'Non-Binary'].map((option) => (
                <button
                  key={option}
                  onClick={() => setGender(option.toLowerCase())}
                  className={`
                    px-4 py-2 rounded-full transition-all duration-300
                    ${gender === option.toLowerCase() 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-50 border border-purple-600 text-purple-600'}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <StyleSelector 
            onStyleSelect={(selectedStyle) => setStyle(selectedStyle)}
          />

          <button 
            onClick={handleGenerate}
            disabled={!image || !jobTitle}
            className={`
              w-full py-4 rounded-full text-xl font-bold transition-all duration-300
              ${image && jobTitle 
                ? 'bg-purple-600 text-white hover:bg-pink-500 transform hover:scale-105 transition-all duration-300 hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
          >
            Generate Caricature
          </button>
        </div>
      </div>

      <LoadingOverlay isLoading={isLoading} />
    </div>
  )
}