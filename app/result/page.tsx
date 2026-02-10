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
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('mymeme_result')
    if (stored) {
      setResult(JSON.parse(stored))
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
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-2" style={{ color: '#1A1A2E' }}>
          Your Meme is Ready! 🎉
        </h1>
        <p className="text-gray-500 mb-8">Looking good as a {result.style} {result.jobTitle}!</p>

        {/* Generated Image */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 mb-8 inline-block">
          <div className="relative w-full max-w-lg mx-auto aspect-square">
            <Image
              src={result.imageUrl}
              alt={`AI cartoon caricature — ${result.jobTitle}`}
              fill
              className="rounded-2xl object-cover"
              unoptimized
            />
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

        {/* Meme Maker Teaser */}
        <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-[#FF8C42] mb-8">
          <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A2E' }}>😂 Make It a Meme!</h3>
          <p className="text-gray-500 mb-4">Put your cartoon face into famous meme templates — Drake, Distracted Boyfriend, and more!</p>
          <span className="inline-block bg-[#FF8C42]/20 text-[#FF8C42] px-4 py-2 rounded-full font-bold text-sm">
            Coming Soon ✨
          </span>
        </div>

        {/* Social Sizing Teaser */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-3" style={{ color: '#1A1A2E' }}>📱 Auto-Sized for Social</h3>
          <div className="flex justify-center gap-3 flex-wrap">
            {['Instagram Post', 'Facebook Cover', 'WhatsApp DP', 'TikTok', 'Twitter Header'].map((platform) => (
              <span key={platform} className="bg-white px-3 py-1 rounded-full text-sm text-gray-500 border">
                {platform}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-3">Premium feature — coming soon</p>
        </div>
      </div>
    </div>
  )
}
