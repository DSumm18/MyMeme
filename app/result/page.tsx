'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface MemeResult {
  imageUrl: string
  prompt: string
  cost?: string
  style: string
  jobTitle: string
}

export default function ResultPage() {
  const [result, setResult] = useState<MemeResult | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('mymeme_result')
    const storedOriginal = sessionStorage.getItem('mymeme_original')
    if (stored) {
      setResult(JSON.parse(stored))
    }
    if (storedOriginal) {
      setOriginalImage(storedOriginal)
    }
  }, [])

  const handleDownload = async () => {
    if (!result?.imageUrl) return
    setDownloading(true)
    try {
      const res = await fetch(result.imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mymeme-${result.style}-${Date.now()}.jpg`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(result.imageUrl, '_blank')
    }
    setDownloading(false)
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#FFF5E1]">
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#1A1A2E' }}>No meme yet!</h1>
          <p className="text-gray-500 mb-8">Create one first — it only takes 10 seconds.</p>
          <Link href="/create" className="bg-[#FF6B9D] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all">
            Create My Meme 🎨
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5E1] to-white py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-2" style={{ color: '#1A1A2E' }}>
          Your Meme is Ready! 🎉
        </h1>
        <p className="text-gray-500 mb-8">Looking good as a {result.style} {result.jobTitle}!</p>

        {/* Before/After Comparison */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
          {/* Original Image - Left */}
          {originalImage && (
            <div className="bg-white rounded-3xl shadow-2xl p-4 w-full md:w-1/2">
              <div className="relative aspect-square">
                <Image
                  src={originalImage}
                  alt="Original Photo"
                  fill
                  className="rounded-2xl object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  Original
                </div>
              </div>
            </div>
          )}

          {/* Generated Image - Right */}
          <div className="bg-white rounded-3xl shadow-2xl p-4 w-full md:w-1/2">
            <div className="relative aspect-square">
              <Image
                src={result.imageUrl}
                alt={`AI cartoon caricature — ${result.jobTitle}`}
                fill
                className="rounded-2xl object-cover"
                unoptimized
              />
              <div className="absolute top-4 left-4 bg-[#FF6B9D] text-white px-3 py-1 rounded-full text-sm">
                {result.style}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-[#FF6B9D] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all"
          >
            {downloading ? 'Downloading...' : '💾 Download'}
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'MyMeme!', text: `Check out my cartoon caricature as a ${result.jobTitle}!`, url: result.imageUrl })
              } else {
                navigator.clipboard.writeText(result.imageUrl)
                alert('Image URL copied!')
              }
            }}
            className="bg-[#6BCB77] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all"
          >
            📤 Share
          </button>
          <Link href="/create" className="bg-[#FFD93D] text-[#1A1A2E] px-8 py-3 rounded-full font-bold hover:scale-105 transition-all">
            🔄 Make Another
          </Link>
        </div>

        {/* Try Another Style Button */}
        <div className="text-center mb-8">
          <Link 
            href="/create" 
            className="bg-[#6BCB77] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            🎨 Try Another Style
          </Link>
        </div>
      </div>
    </div>
  )
}