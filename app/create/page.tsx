'use client'

import { useState, useRef, useEffect } from 'react'
import { loadingPhrases } from './LoadingPhrases'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Rest of the component (handleGenerate, useEffect, render) remains exactly the same as before
  // ... (paste the rest of the previous implementation)
}