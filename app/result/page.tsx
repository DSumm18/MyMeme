'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
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
  const { user } = useAuth()
  
  // Meme overlay state
  const [showMemeEditor, setShowMemeEditor] = useState(false)
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animation state
  const [animating, setAnimating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [animateError, setAnimateError] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('mymeme_result')
    const storedOriginal = sessionStorage.getItem('mymeme_original')
    if (stored) {
      const parsedResult = JSON.parse(stored)
      setResult(parsedResult)
      
      // Save to Supabase if user is logged in
      const saveCreation = async () => {
        if (!user || !parsedResult) return

        const { error } = await supabase
          .from('creations')
          .insert({
            user_id: user.id,
            original_image_url: storedOriginal || '',
            generated_image_url: parsedResult.imageUrl,
            style: parsedResult.style,
            prompt: parsedResult.prompt || '',
            job_title: parsedResult.jobTitle,
            gender: 'Unknown', // Consider adding this to the prompt or result
            cost: parseFloat(parsedResult.cost?.replace('$', '') || '0')
          })

        if (error) {
          console.error('Error saving creation:', error)
        }
      }

      saveCreation()
    }
    if (storedOriginal) {
      setOriginalImage(storedOriginal)
    }
  }, [user])

  // Download image
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

  // Meme canvas drawing
  const drawMemeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !result) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Load image onto canvas
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Meme text styling
      ctx.font = `bold ${Math.floor(canvas.width * 0.1)}px Impact, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = Math.floor(canvas.width * 0.008)

      // Top text
      if (topText) {
        const topTextUpper = topText.toUpperCase()
        // Draw outline
        ctx.strokeText(topTextUpper, canvas.width / 2, canvas.height * 0.1)
        // Draw fill
        ctx.fillText(topTextUpper, canvas.width / 2, canvas.height * 0.1)
      }

      // Bottom text
      if (bottomText) {
        const bottomTextUpper = bottomText.toUpperCase()
        // Draw outline
        ctx.strokeText(bottomTextUpper, canvas.width / 2, canvas.height * 0.9)
        // Draw fill
        ctx.fillText(bottomTextUpper, canvas.width / 2, canvas.height * 0.9)
      }
    }
    img.src = result.imageUrl
  }

  // Download meme canvas
  const downloadMemeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Redraw canvas to ensure latest text
    drawMemeCanvas()

    // Short timeout to ensure image is drawn
    setTimeout(() => {
      const url = canvas.toDataURL('image/jpeg')
      const a = document.createElement('a')
      a.href = url
      a.download = `meme-${Date.now()}.jpg`
      a.click()
    }, 100)
  }

  // Update canvas when meme text changes
  useEffect(() => {
    if (showMemeEditor) {
      drawMemeCanvas()
    }
  }, [showMemeEditor, topText, bottomText, result])

  // Animate handler - two-step: submit task, then poll from client
  const handleAnimate = async () => {
    if (!result?.imageUrl) return
    setAnimating(true)
    setAnimateError(null)
    try {
      // Step 1: Submit the video task
      const submitRes = await fetch('/api/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: result.imageUrl }),
      })
      const submitData = await submitRes.json()
      if (!submitRes.ok) throw new Error(submitData.error || 'Animation failed to start')

      const { taskUUID } = submitData

      // Step 2: Poll from client every 5s for up to 4 minutes
      const maxAttempts = 48
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        const pollRes = await fetch('/api/animate/poll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskUUID }),
        })
        const pollData = await pollRes.json()

        if (pollData.status === 'complete') {
          setVideoUrl(pollData.videoUrl)
          setShowVideoModal(true)
          return
        }
        if (pollData.status === 'error') {
          throw new Error(pollData.error || 'Video generation failed')
        }
        // else 'processing' - continue polling
      }
      throw new Error('Video generation timed out. Please try again.')
    } catch (err) {
      setAnimateError(err instanceof Error ? err.message : 'Animation failed')
    } finally {
      setAnimating(false)
    }
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
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5E1] to-white py-12 relative">
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
          <button 
            onClick={() => setShowMemeEditor(true)}
            className="bg-[#4D96FF] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all"
          >
            😂 Make it a Meme
          </button>
          <button
            onClick={handleAnimate}
            disabled={animating}
            className="bg-[#9B59B6] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {animating ? '⏳ Animating (~2 min)...' : '🎬 Animate it'}
          </button>
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

      {/* Animation Error */}
      {animateError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full z-50 shadow-lg">
          ❌ {animateError}
          <button onClick={() => setAnimateError(null)} className="ml-3 font-bold">✕</button>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && videoUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">🎬 Your Animated Meme!</h2>
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="w-full rounded-lg shadow-lg mb-4"
            />
            <div className="flex justify-between space-x-4">
              <button
                onClick={() => setShowVideoModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
              <a
                href={videoUrl}
                download={`mymeme-animated-${Date.now()}.mp4`}
                className="flex-1 bg-[#9B59B6] text-white px-4 py-2 rounded-lg hover:scale-105 transition text-center"
              >
                💾 Download Video
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Meme Text Overlay */}
      {showMemeEditor && result && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">😂 Make it a Meme</h2>
            
            {/* Input Fields */}
            <div className="space-y-4 mb-4">
              <input 
                type="text" 
                placeholder="TOP TEXT" 
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]"
              />
              <input 
                type="text" 
                placeholder="BOTTOM TEXT" 
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]"
              />
            </div>

            {/* Canvas Preview */}
            <div className="mb-4 max-h-[50vh] overflow-auto">
              <canvas 
                ref={canvasRef} 
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between space-x-4">
              <button 
                onClick={() => setShowMemeEditor(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button 
                onClick={downloadMemeCanvas}
                className="flex-1 bg-[#FF6B9D] text-white px-4 py-2 rounded-lg hover:scale-105 transition"
              >
                Download Meme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}