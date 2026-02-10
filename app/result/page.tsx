'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function ResultPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [style, setStyle] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  useEffect(() => {
    // Extract parameters from URL
    const params = new URLSearchParams(window.location.search)
    const image = params.get('image')
    const selectedStyle = params.get('style')
    const selectedJobTitle = params.get('jobTitle')

    if (image) setImageUrl(image)
    if (selectedStyle) setStyle(selectedStyle)
    if (selectedJobTitle) setJobTitle(selectedJobTitle)
  }, [])

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `mymeme-${style}-${jobTitle}.png`
      link.click()
    }
  }

  const handleShare = async () => {
    if (navigator.share && imageUrl) {
      try {
        const blob = await fetch(imageUrl).then(r => r.blob())
        const file = new File([blob], `mymeme-${style}-${jobTitle}.png`, { type: 'image/png' })
        
        await navigator.share({
          title: `My ${style} Work Meme`,
          text: `Check out my hilarious work meme as a ${jobTitle}!`,
          files: [file]
        })
      } catch (error) {
        console.error('Sharing failed', error)
      }
    } else {
      // Fallback for browsers without native share
      alert('Sharing not supported. Try downloading and sharing manually.')
    }
  }

  const handleCreateAnother = () => {
    window.location.href = '/create'
  }

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-2xl text-dark-blue">
          Loading your meme... 🚀
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bright-yellow/10 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-8 text-dark-blue">
          Your Awesome Work Meme! 🎉
        </h1>

        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <Image 
            src={imageUrl} 
            alt="Generated meme" 
            width={600} 
            height={600} 
            className="mx-auto rounded-lg mb-6 animate-fade-in-up"
          />
          <p className="text-xl text-dark-blue">
            {jobTitle} in {style} style
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={handleDownload}
            className="
              bg-mint-green text-white 
              px-8 py-3 rounded-full 
              hover:bg-mint-green/90 transition-all
            "
          >
            Download 💾
          </button>
          <button 
            onClick={handleShare}
            className="
              bg-coral-orange text-white 
              px-8 py-3 rounded-full 
              hover:bg-coral-orange/90 transition-all
            "
          >
            Share 🔗
          </button>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleCreateAnother}
            className="
              bg-primary-pink text-white 
              px-10 py-4 rounded-full text-xl
              hover:bg-primary-pink/90 transition-all
            "
          >
            Create Another Meme 🎨
          </button>

          <p className="text-sm text-dark-blue/70">
            Not quite right? Try another style or photo! 🔄
          </p>
        </div>
      </div>
    </div>
  )
}