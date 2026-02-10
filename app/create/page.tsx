'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function CreatePage() {
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const styles = [
    { 
      id: 'caricature', 
      name: 'Caricature', 
      image: '/style-caricature.jpg',
      description: 'Exaggerated nurse style!' 
    },
    { 
      id: 'teacher', 
      name: 'Teacher', 
      image: '/style-teacher.jpg',
      description: 'Classroom-chic cartoon!' 
    },
    { 
      id: 'anime', 
      name: 'Anime', 
      image: '/style-anime.jpg',
      description: 'Japanese anime office worker!' 
    },
    { 
      id: 'watercolor', 
      name: 'Watercolor', 
      image: '/style-watercolor.jpg',
      description: 'Artistic watercolor chef!' 
    }
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = () => {
    if (selectedImage && selectedStyle && jobTitle) {
      // Redirect to result page with parameters
      const params = new URLSearchParams({
        image: selectedImage,
        style: selectedStyle,
        jobTitle
      })
      window.location.href = `/result?${params.toString()}`
    } else {
      alert('Please complete all steps: upload image, choose style, and enter job title!')
    }
  }

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-dark-blue">
          Create Your Work Meme 🎨
        </h1>

        {/* Image Upload */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">📸 Upload Your Selfie</h2>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="
              border-2 border-dashed border-primary-pink 
              rounded-xl p-12 text-center cursor-pointer 
              hover:bg-primary-pink/10 transition-colors
            "
          >
            {selectedImage ? (
              <Image 
                src={selectedImage} 
                alt="Uploaded selfie" 
                width={300} 
                height={300} 
                className="mx-auto rounded-lg"
              />
            ) : (
              <div className="text-dark-blue/70">
                Click to upload your work selfie or drag & drop
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </section>

        {/* Job Title Input */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">💼 What's Your Job?</h2>
          <input 
            type="text" 
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="E.g., Nurse, Teacher, Software Engineer"
            className="
              w-full p-4 border-2 border-mint-green 
              rounded-xl focus:outline-none 
              focus:border-primary-pink transition-colors
            "
          />
        </section>

        {/* Style Selection */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">🎨 Choose Your Style</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {styles.map((style) => (
              <div 
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`
                  p-4 rounded-xl cursor-pointer transition-all 
                  ${selectedStyle === style.id 
                    ? 'bg-primary-pink/20 scale-105 border-2 border-primary-pink' 
                    : 'bg-white hover:bg-bright-yellow/20'}
                `}
              >
                <Image 
                  src={style.image} 
                  alt={style.name} 
                  width={300} 
                  height={300} 
                  className="rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold">{style.name}</h3>
                <p className="text-sm text-dark-blue/70">{style.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Generate Button */}
        <div className="text-center">
          <button 
            onClick={handleGenerate}
            disabled={!selectedImage || !selectedStyle || !jobTitle}
            className={`
              px-12 py-4 text-xl rounded-full transition-all
              ${selectedImage && selectedStyle && jobTitle 
                ? 'bg-primary-pink text-white hover:bg-primary-pink/90' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
          >
            Generate My Meme 🚀
          </button>
        </div>
      </div>
    </div>
  )
}