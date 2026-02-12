'use client'

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { addJob } from '@/lib/job-queue'
import { useAuth } from '@/lib/auth-context'
import { useCredits } from '@/lib/credits-context'

const USE_CASES = [
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Family Memories',
    description: 'Bring old family photos from the 80s and 90s back to life',
    bgColor: 'bg-[#FFE4E1]'
  },
  {
    icon: '💒',
    title: 'Wedding Moments',
    description: 'Watch your wedding photos smile and move',
    bgColor: 'bg-[#E6E6FA]'
  },
  {
    icon: '👶',
    title: 'Baby\'s First Photos',
    description: 'See your baby photos come alive with adorable movement',
    bgColor: 'bg-[#E0FFFF]'
  },
  {
    icon: '🎨',
    title: 'Styled Art',
    description: 'Animate your AI-generated art styles too',
    bgColor: 'bg-[#F0FFF0]'
  }
]

export default function AnimatePage() {
  const { user, signIn, loading: authLoading } = useAuth()
  const { credits, deductCredits, loading: creditsLoading } = useCredits()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [duration, setDuration] = useState<5 | 10>(5)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Authentication and Credit Gates
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-4">Sign in to Animate</h2>
          <p className="text-gray-600 mb-6">Create an account to start animating your photos!</p>
          <button onClick={signIn} className="bg-[#FF6B9D] text-white px-8 py-3 rounded-full text-lg font-bold hover:scale-105 transition-all">
            Sign in with Google 🚀
          </button>
        </div>
      </div>
    )
  }

  if (user && credits < 5 && !creditsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-4">Out of Credits!</h2>
          <p className="text-gray-600 mb-6">You need at least 5 credits to animate a photo. Get more credits to bring your memories to life!</p>
          <Link href="/pricing" className="bg-[#FF6B9D] text-white px-8 py-3 rounded-full text-lg font-bold hover:scale-105 transition-all inline-block">
            Get More Credits 💰
          </Link>
        </div>
      </div>
    )
  }

  const handleFileUpload = async (file: File | null) => {
    if (!file) return

    // Reset previous state
    setPreviewImage(null)
    setIsUploading(false)

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (JPEG, PNG, or WebP)')
      return
    }

    if (file.size > maxSize) {
      alert('Image must be less than 10MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleSubmit = async () => {
    if (!imageFile) {
      alert('Please upload an image first')
      return
    }

    const cost = duration === 10 ? 10 : 5
    setIsUploading(true)

    try {
      // Deduct credits first
      const hasCredits = await deductCredits(cost)
      if (!hasCredits) {
        throw new Error('Not enough credits')
      }

      // First upload image to Runware
      const formData = new FormData()
      formData.append('file', imageFile)

      const runwareUploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!runwareUploadResponse.ok) {
        throw new Error('Image upload failed')
      }

      const { imageUrl } = await runwareUploadResponse.json()

      // Then add job to queue for animation
      const newJob = {
        id: Date.now().toString(),
        taskUUID: Math.random().toString(36).substring(2),
        sourceImageUrl: imageUrl,
        thumbnailUrl: previewImage || '',
        style: 'original',
        status: 'processing' as const,
        startedAt: Date.now(),
        duration: duration
      }

      addJob(newJob)

      // TODO: Implement a way to show job progress or redirect to a job queue view
    } catch (error) {
      console.error('Animation job creation failed:', error)
      alert('Failed to create animation job. Please try again.')
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFFFF] via-[#FFE8F0] to-[#FFFFFF] py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4 text-[#1A1A2E]">
            Bring Any Photo to Life ✨
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload any photo and watch it come alive with natural movement. 
            Old family photos, wedding shots, baby pictures — give them the magic of motion.
          </p>
          
          {/* Trust Badges */}
          <div className="flex justify-center gap-6 mt-6 text-gray-700">
            <div className="flex items-center gap-2">
              <span>✅</span> 5 Second Clips
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span> Works with Any Photo
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span> Download Instantly
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-xl mx-auto mb-16">
          <div 
            className={`border-4 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${
              previewImage 
                ? 'border-[#FF6B9D]/50 bg-[#FF6B9D]/5' 
                : 'border-gray-300 hover:border-[#FF6B9D] hover:bg-[#FF6B9D]/5'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {previewImage ? (
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <Image 
                  src={previewImage} 
                  alt="Uploaded image preview" 
                  fill 
                  className="object-contain" 
                />
              </div>
            ) : (
              <>
                <div className="text-6xl mb-4">📸</div>
                <p className="text-gray-500 mb-4">Drag and drop your image here, or</p>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-[#FF6B9D] text-white px-8 py-4 rounded-full hover:bg-[#FF3D7A] transition-colors text-lg"
                >
                  Select Image 📸
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Supports JPG, PNG, WebP — max 10MB
                </p>
              </>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/jpeg,image/png,image/webp" 
              className="hidden" 
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileUpload(e.target.files?.[0] || null)}
            />
          </div>

          {previewImage && (
            <div className="mt-6">
              <label className="block text-lg font-bold mb-3 text-center">
                Animation Duration 🕒
              </label>
              <div className="flex gap-4">
                {[5, 10].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setDuration(dur as 5 | 10)}
                    className={`flex-1 py-4 rounded-full text-lg transition-all duration-300 ${
                      duration === dur 
                        ? 'bg-[#FF6B9D] text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {dur} seconds
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {previewImage && (
            <button 
              onClick={handleSubmit}
              disabled={isUploading}
              className="mt-6 w-full bg-[#1A1A2E] text-white py-4 rounded-full text-xl font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isUploading ? 'Processing...' : 'Animate Now 🎬'}
            </button>
          )}
        </div>

        {/* Use Cases Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-center mb-8 text-[#1A1A2E]">
            See the Magic of Motion 🌟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {USE_CASES.map((useCase, index) => (
              <div 
                key={index} 
                className={`${useCase.bgColor} p-6 rounded-3xl text-center transform transition-all hover:scale-105 hover:shadow-xl`}
              >
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                <p className="text-gray-700">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
          <h2 className="text-3xl font-black mb-8 text-[#1A1A2E]">
            How It Works 🛠️
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📸', title: 'Upload Any Photo', description: 'Select a photo from your device or drag and drop' },
              { icon: '⏱️', title: 'Choose Duration', description: 'Pick 5 or 10 seconds of magical animation' },
              { icon: '🎬', title: 'Download Video', description: 'Receive your animated video instantly' }
            ].map((step, index) => (
              <div key={index} className="bg-[#F5F5F5] p-6 rounded-3xl">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-700">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}