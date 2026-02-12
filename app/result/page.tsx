'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { addJob, getJobs } from '@/lib/job-queue'

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
  const [animateProgress, setAnimateProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [animateError, setAnimateError] = useState<string | null>(null)
  
  // Duration picker state
  const [showDurationPicker, setShowDurationPicker] = useState(false)
  const [pendingAnimateImage, setPendingAnimateImage] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<5 | 10>(5)

  // 🎉 Celebration confetti on page load
  const fireCelebration = () => {
    // First burst - center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B9D', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6'],
    })
    // Left side
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF6B9D', '#FFD93D', '#6BCB77'],
      })
    }, 200)
    // Right side
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4D96FF', '#9B59B6', '#FF6B9D'],
      })
    }, 400)
  }

  // Fire confetti when video completes too
  const fireVideoCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#9B59B6', '#FF6B9D', '#FFD93D', '#6BCB77'],
      shapes: ['star', 'circle'],
    })
    // Play a celebration ding sound
    try {
      const actx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = actx.createOscillator()
        const gain = actx.createGain()
        osc.connect(gain)
        gain.connect(actx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.3, actx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + start + dur)
        osc.start(actx.currentTime + start)
        osc.stop(actx.currentTime + start + dur)
      }
      playTone(523, 0, 0.15)    // C5
      playTone(659, 0.1, 0.15)  // E5
      playTone(784, 0.2, 0.3)   // G5 - triumphant ding!
    } catch {}
  }

  useEffect(() => {
    const stored = sessionStorage.getItem('mymeme_result')
    const storedOriginal = sessionStorage.getItem('mymeme_original')
    if (stored) {
      const parsedResult = JSON.parse(stored)
      setResult(parsedResult)
      // 🎉 Fire confetti when result loads!
      setTimeout(fireCelebration, 500)
      
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

  // Listen for job completions to show video modal
  useEffect(() => {
    const handleJobUpdate = () => {
      const jobs = getJobs()
      const justCompleted = jobs.find(j => 
        j.status === 'complete' && 
        j.videoUrl && 
        j.completedAt && 
        Date.now() - j.completedAt < 5000
      )
      if (justCompleted && justCompleted.videoUrl) {
        setVideoUrl(justCompleted.videoUrl)
        setShowVideoModal(true)
        fireVideoCelebration()
      }
    }
    window.addEventListener('jobqueue-updated', handleJobUpdate)
    return () => window.removeEventListener('jobqueue-updated', handleJobUpdate)
  }, [])

  // Show duration picker before animating (only for original photos — styled = 5s always)
  const promptAnimate = (imageUrl?: string) => {
    const isOriginalPhoto = imageUrl === originalImage
    setPendingAnimateImage(imageUrl || result?.imageUrl || null)
    setSelectedDuration(5)
    if (isOriginalPhoto) {
      // Original photo — let user choose 5s or 10s
      setShowDurationPicker(true)
    } else {
      // Styled image — 5s only, skip picker and go straight
      handleAnimate(5)
    }
  }

  // Animate handler - submits to background job queue
  const handleAnimate = async (duration: 5 | 10 = 5) => {
    const targetImage = pendingAnimateImage || result?.imageUrl
    if (!targetImage) return
    
    const cost = duration === 10 ? 10 : 5
    setShowDurationPicker(false)
    setAnimating(true)
    setAnimateError(null)
    
    try {
      // First check credits
      const hasCredits = await deductCredits(cost)
      if (!hasCredits) {
        throw new Error('Not enough credits to animate')
      }

      // Determine style: if animating original photo, style is 'original'
      const isOriginal = targetImage === originalImage
      const animStyle = isOriginal ? 'original' : (result?.style || 'original')

      // Submit the video task with duration and style
      const submitRes = await fetch('/api/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: targetImage, duration, style: animStyle }),
      })
      const submitData = await submitRes.json()
      if (!submitRes.ok) throw new Error(submitData.error || 'Animation failed to start')

      const { taskUUID } = submitData

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }

      // Add to background job queue — JobPoller handles the rest
      addJob({
        id: taskUUID,
        taskUUID,
        sourceImageUrl: targetImage,
        thumbnailUrl: targetImage,
        style: `${result?.style || 'original'} (${duration}s)`,
        status: 'processing',
        startedAt: Date.now(),
      })

      // Show confirmation
      setAnimateError(null)
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
            onClick={() => promptAnimate()}
            disabled={animating}
            className="bg-[#9B59B6] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all disabled:opacity-50"
          >
            {animating ? '⏳ Submitting...' : '🎬 Animate it'}
          </button>
          {originalImage && (
            <button
              onClick={() => promptAnimate(originalImage)}
              disabled={animating}
              className="bg-[#E67E22] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all disabled:opacity-50"
            >
              {animating ? '⏳' : '📸 Animate Original'}
            </button>
          )}
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

      {/* Duration Picker Modal */}
      {showDurationPicker && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-2 text-center">⏱️ Animation Length</h2>
            <p className="text-gray-500 text-center mb-6 text-sm">Choose how long your animation will be</p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedDuration(5)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedDuration === 5 
                    ? 'border-[#9B59B6] bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">5 seconds</div>
                    <div className="text-gray-500 text-sm">Quick & fun — perfect for sharing</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#9B59B6]">5 credits</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedDuration(10)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedDuration === 10 
                    ? 'border-[#9B59B6] bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">10 seconds ✨</div>
                    <div className="text-gray-500 text-sm">Cinematic — great for gifts & memories</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#9B59B6]">10 credits</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDurationPicker(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAnimate(selectedDuration)}
                className="flex-1 bg-[#9B59B6] text-white px-4 py-3 rounded-xl font-bold hover:scale-105 transition-all"
              >
                🎬 Create Animation
              </button>
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