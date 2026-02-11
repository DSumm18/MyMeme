'use client'

import { useState, useEffect, useRef } from 'react'
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
  
  // Animation states
  const [animationStatus, setAnimationStatus] = useState<{
    loading: boolean
    videoUrl: string | null
    error: string | null
  }>({
    loading: false,
    videoUrl: null,
    error: null
  })

  // Existing states...
  const [showMemeEditor, setShowMemeEditor] = useState(false)
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  // Animate function
  const handleAnimate = async () => {
    if (!result?.imageUrl) return

    // Reset previous state
    setAnimationStatus({ 
      loading: true, 
      videoUrl: null, 
      error: null 
    })

    try {
      const response = await fetch('/api/animate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: result.imageUrl })
      })

      const data = await response.json()

      if (response.ok) {
        setAnimationStatus({
          loading: false,
          videoUrl: data.videoUrl,
          error: null
        })
      } else {
        setAnimationStatus({
          loading: false,
          videoUrl: null,
          error: data.error || 'Failed to generate animation'
        })
      }
    } catch (error) {
      setAnimationStatus({
        loading: false,
        videoUrl: null,
        error: 'Network error occurred'
      })
    }
  }

  // Close video modal
  const handleCloseVideoModal = () => {
    setAnimationStatus({
      loading: false,
      videoUrl: null,
      error: null
    })
  }

  // Download video
  const handleDownloadVideo = () => {
    if (!animationStatus.videoUrl) return

    const a = document.createElement('a')
    a.href = animationStatus.videoUrl
    a.download = `mymeme-animated-${Date.now()}.mp4`
    a.click()
  }

  // Rest of the existing code remains the same...

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5E1] to-white py-12 relative">
      {/* Existing content... */}

      {/* Action Buttons - update this section */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {/* Existing buttons... */}
        <button 
          onClick={() => setShowMemeEditor(true)}
          className="bg-[#4D96FF] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all"
        >
          😂 Make it a Meme
        </button>
        {result && (
          <button 
            onClick={handleAnimate}
            disabled={animationStatus.loading}
            className="bg-[#6BCB77] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all"
          >
            {animationStatus.loading ? 'Animating... ⏳' : '🎬 Animate it'}
          </button>
        )}
      </div>

      {/* Animation Video Modal */}
      {(animationStatus.loading || animationStatus.videoUrl || animationStatus.error) && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            {animationStatus.loading && (
              <div className="text-center">
                <div className="text-4xl mb-4">🎬</div>
                <h2 className="text-2xl font-bold mb-4">Animating...</h2>
                <p className="text-gray-500 mb-4">This takes about 60 seconds ⏳</p>
                <div className="animate-pulse h-2 w-full bg-gray-200 rounded">
                  <div className="h-2 bg-[#6BCB77] rounded" style={{ width: '50%' }}></div>
                </div>
              </div>
            )}

            {animationStatus.videoUrl && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-center">🎉 Your Animated Meme!</h2>
                <div className="mb-4 rounded-lg overflow-hidden shadow-lg">
                  <video 
                    controls 
                    src={animationStatus.videoUrl} 
                    className="w-full"
                    autoPlay 
                    loop
                  />
                </div>
                <div className="flex justify-between space-x-4">
                  <button 
                    onClick={handleCloseVideoModal}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                  <button 
                    onClick={handleDownloadVideo}
                    className="flex-1 bg-[#6BCB77] text-white px-4 py-2 rounded-lg hover:scale-105 transition"
                  >
                    Download Video
                  </button>
                </div>
              </div>
            )}

            {animationStatus.error && (
              <div className="text-center">
                <div className="text-4xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-red-500 mb-4">Animation Failed</h2>
                <p className="text-gray-500 mb-4">{animationStatus.error}</p>
                <button 
                  onClick={handleCloseVideoModal}
                  className="bg-[#FF6B9D] text-white px-8 py-3 rounded-full hover:scale-105 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of the existing code... */}
    </div>
  )
}