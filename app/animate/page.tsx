'use client'

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { addJob } from '@/lib/job-queue'

export default function AnimatePage() {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [duration, setDuration] = useState<5 | 10>(5)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    setIsUploading(true)

    try {
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
        startedAt: Date.now()
      }

      addJob(newJob)

      // Redirect or show animation processing
      // You might want to implement a dedicated animation tray/page
    } catch (error) {
      console.error('Animation job creation failed:', error)
      alert('Failed to create animation job. Please try again.')
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E1] via-[#FFE8F0] to-[#E8F5E9] flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative">
        <div className="absolute top-4 right-4">
          <Link href="/" className="text-3xl">✖️</Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black mb-6 text-center" style={{ color: '#1A1A2E' }}>
          🎬 Animate Any Photo
        </h1>
        
        <div 
          className={`border-4 border-dashed rounded-2xl p-8 text-center transition-all duration-300 mb-6 ${
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
              <p className="text-gray-500 mb-4">Drag and drop your image here, or</p>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="bg-[#FF6B9D] text-white px-6 py-3 rounded-full hover:bg-[#FF3D7A] transition-colors"
              >
                Select Image 📸
              </button>
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
          <div className="mb-6">
            <label className="block text-lg font-bold mb-3" style={{ color: '#1A1A2E' }}>
              Animation Duration 🕒
            </label>
            <div className="flex gap-4">
              {[5, 10].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setDuration(dur as 5 | 10)}
                  className={`flex-1 py-3 rounded-lg transition-all duration-300 ${
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
            className="w-full bg-[#1A1A2E] text-white py-4 rounded-full text-xl font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isUploading ? 'Processing...' : 'Animate It 🎬'}
          </button>
        )}
      </div>
    </div>
  )
}