'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import Image from 'next/image'

export default function ImageUploader({ 
  onImageUpload 
}: { 
  onImageUpload: (file: File) => void 
}) {
  const [dragActive, setDragActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = (files: FileList) => {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onImageUpload(file)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  return (
    <div 
      className={`
        border-2 border-dashed border-purple-600 hover:border-pink-500 transition-colors duration-300 p-8 rounded-lg text-center 
        ${dragActive ? 'bg-pink-500/10 border-secondary' : 'bg-purple-50'}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />
      
      {previewImage ? (
        <div className="flex flex-col items-center">
          <Image 
            src={previewImage} 
            alt="Preview" 
            width={300} 
            height={300} 
            className="rounded-lg mb-4 max-h-64 object-cover"
          />
          <button 
            onClick={() => {
              setPreviewImage(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="bg-purple-600 text-white hover:bg-pink-500 transform hover:scale-105 transition-all duration-300 px-4 py-2 rounded-full"
          >
            Change Image
          </button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-gray-600">
            Drag & Drop your selfie or 
            <button 
              onClick={() => inputRef.current?.click()}
              className="text-purple-600 ml-2 underline"
            >
              Click to Upload
            </button>
          </p>
          <div className="text-6xl text-purple-600/50 text-center mb-4">
            📸
          </div>
          <p className="text-sm text-gray-500">
            JPG, PNG, max 10MB
          </p>
        </>
      )}
    </div>
  )
}