'use client'

import { useState, useRef, useEffect, Suspense, useCallback } from 'react'
import { loadingPhrases } from './LoadingPhrases'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useCredits } from '@/lib/credits-context'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const LOADING_EMOJIS = ['🎨', '🖌️', '✨', '🎭', '🖼️']

const LoadingOverlay = ({ onCancel, currentPhrase, currentEmoji }: { onCancel: () => void; currentPhrase: string; currentEmoji: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    <div className="glass-card max-w-md rounded-2xl p-8 text-center">
      <motion.div
        key={currentEmoji}
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        className="text-6xl mb-4"
      >
        {currentEmoji}
      </motion.div>
      <motion.p key={currentPhrase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-lg text-white/80 mb-4">
        {currentPhrase}
      </motion.p>
      <p className="text-sm text-white/40 mb-4">Usually takes about 15 seconds</p>
      <div className="w-48 h-1 bg-[#111]/10 rounded-full mx-auto mb-6 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" animate={{ width: ['0%', '100%'] }} transition={{ duration: 15, ease: 'linear' }} />
      </div>
      <button onClick={onCancel} className="px-4 py-2 text-sm text-white/50 hover:text-white border border-white/10 rounded-lg hover:bg-[#111]/5 transition-colors">
        Cancel
      </button>
    </div>
  </motion.div>
)

function compressImage(file: File, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > h) { if (w > maxWidth) { h *= maxWidth / w; w = maxWidth } }
        else { if (h > maxWidth) { w *= maxWidth / h; h = maxWidth } }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = event.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function CreatePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#888]">Loading...</div>}>
      <CreatePage />
    </Suspense>
  )
}

function CreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signIn, loading: authLoading } = useAuth()
  const { credits, deductCredits, loading: creditsLoading } = useCredits()
  const initialStyle = searchParams.get('style') || 'ghibli'
  const [selectedStyle, setSelectedStyle] = useState(initialStyle)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [gender, setGender] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [accessories, setAccessories] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPhrase, setCurrentPhrase] = useState(loadingPhrases[0])
  const [currentEmoji, setCurrentEmoji] = useState(LOADING_EMOJIS[0])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check for pre-uploaded image from homepage
  useEffect(() => {
    const upload = sessionStorage.getItem('mymeme_upload')
    if (upload) {
      setSelectedImage(upload)
      sessionStorage.removeItem('mymeme_upload')
    }
  }, [])

  // Check anonymous free credits
  const getAnonCredits = () => {
    if (typeof window === 'undefined') return 3
    const used = parseInt(localStorage.getItem('mymeme_anon_used') || '0', 10)
    return Math.max(0, 3 - used)
  }

  const anonCredits = getAnonCredits()
  const effectiveCredits = user ? credits : anonCredits
  const isOutOfCredits = user ? (credits < 1 && !creditsLoading) : (anonCredits < 1)

  if (isOutOfCredits) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="bg-[#111] border-2 border-gray-100 rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-[#F5F0E8] mb-4">Out of Credits!</h2>
          <p className="text-[#888] mb-6">
            {user
              ? 'Get more credits to keep creating amazing transformations!'
              : 'Sign in to get 3 more free credits, or purchase a pack!'}
          </p>
          {!user && (
            <button onClick={signIn} className="mb-3 px-8 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 hover:scale-105 transition-all block mx-auto">
              Sign in for 3 Free Credits 🚀
            </button>
          )}
          <Link href="/pricing" className="inline-block px-8 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 hover:scale-105 transition-all">
            Get More Credits 💰
          </Link>
        </div>
      </div>
    )
  }

  const styles = [
    // New trending styles first
    { id: 'ghibli', name: 'Ghibli', emoji: '🌸', description: 'Studio Ghibli anime', image: '/examples/ghibli.jpg', hot: true },
    { id: 'cyberpunk-neon', name: 'Cyberpunk', emoji: '🌃', description: 'Neon cyberpunk vibes', image: '/examples/cyberpunk-neon.jpg', hot: true },
    { id: 'renaissance', name: 'Renaissance', emoji: '🏛️', description: 'Classical master painting', image: '/examples/renaissance.jpg', hot: true },
    { id: 'oil-painting', name: 'Oil Painting', emoji: '🖼️', description: 'Rich textured oils', image: '/examples/oil-painting.jpg', hot: true },
    { id: 'italian-brainrot', name: 'Italian Brainrot', emoji: '🤌', description: 'Viral meme style', image: '/examples/italian-brainrot.jpg', hot: true },
    // Existing popular styles
    { id: 'anime', name: 'Anime', emoji: '⚡', description: 'Japanese anime style', image: '/examples/anime.jpg' },
    { id: 'pixar', name: 'Pixar 3D', emoji: '✨', description: 'Animated character', image: '/examples/pixar.jpg' },
    { id: 'caricature', name: 'Caricature', emoji: '🎨', description: 'Fun exaggerated portrait', image: '/examples/caricature.jpg' },
    { id: 'gta', name: 'GTA V', emoji: '🔫', description: 'Game loading screen', image: '/examples/gta.jpg' },
    { id: 'pop-art', name: 'Pop Art', emoji: '💥', description: 'Warhol-style art', image: '/examples/pop-art.jpg' },
    { id: 'watercolor', name: 'Watercolor', emoji: '🖌️', description: 'Soft artistic portrait', image: '/examples/watercolor.jpg' },
    { id: 'superhero', name: 'Superhero', emoji: '🦸', description: 'Comic book hero', image: '/examples/superhero.jpg' },
    { id: 'clay-3d', name: 'Claymation', emoji: '🧊', description: 'Sculpted clay look', image: '/styles/clay-3d.png' },
    { id: 'pencil-sketch', name: 'Pencil Sketch', emoji: '✏️', description: 'Hand-drawn artistry', image: '/styles/pencil-sketch.png' },
    { id: 'comic-book', name: 'Comic Book', emoji: '💬', description: 'Action comic style', image: '/styles/comic-book.png' },
    { id: 'sticker', name: 'Sticker', emoji: '🏷️', description: 'Die-cut cool vibes', image: '/styles/sticker.png' },
    { id: 'retro-80s', name: 'Retro 80s', emoji: '🕹️', description: 'Synthwave nostalgia', image: '/styles/retro-80s.png' },
  ]

  useEffect(() => {
    if (!loading) return
    const pi = setInterval(() => setCurrentPhrase(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]), 2500)
    const ei = setInterval(() => setCurrentEmoji(LOADING_EMOJIS[Math.floor(Math.random() * LOADING_EMOJIS.length)]), 2000)
    return () => { clearInterval(pi); clearInterval(ei) }
  }, [loading])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Image too large. Max 10MB.'); return }
    try {
      const compressed = await compressImage(file, 1024, 0.8)
      setSelectedImage(compressed)
      setError('')
    } catch { setError('Image compression failed. Please try another image.') }
  }

  const handleGenerate = async () => {
    if (!selectedImage) { setError('Please upload a photo!'); return }
    setLoading(true); setError('')
    try {
      if (user) {
        const creditResult = await deductCredits(1)
        if (!creditResult) throw new Error('Not enough credits.')
      } else {
        // Anonymous user — deduct from localStorage
        const used = parseInt(localStorage.getItem('mymeme_anon_used') || '0', 10)
        if (used >= 3) throw new Error('No free credits left. Sign in for more!')
        localStorage.setItem('mymeme_anon_used', String(used + 1))
      }

      const res = await fetch('/api/generate-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage, style: selectedStyle, gender, jobTitle, accessories, location }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed.')

      sessionStorage.setItem('mymeme_original', selectedImage)
      sessionStorage.setItem('mymeme_result', JSON.stringify({ imageUrl: data.imageUrl, prompt: data.prompt, cost: data.cost, style: selectedStyle, jobTitle }))
      router.push('/result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <>
      {loading && <LoadingOverlay onCancel={() => setLoading(false)} currentPhrase={currentPhrase} currentEmoji={currentEmoji} />}
      
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[#111111]/60 backdrop-blur-2xl border border-[#2A2A2A]/60 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/40">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-[#F5F0E8] mb-2">Transform Your Photo</h1>
            <p className="text-[#888]">Choose a style and watch the magic happen</p>
          </motion.div>

          {/* Step 1: Upload */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
            <h2 className="text-lg font-bold text-[#F5F0E8] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-black text-white">1</span>
              Upload Your Photo
            </h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                selectedImage ? 'border-[#FF90E8] bg-[#FF90E8]/5' : 'border-[#333] hover:border-[#FF90E8] hover:bg-[#1A1A1A]'
              }`}
            >
              {selectedImage ? (
                <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden ring-2 ring-[#FF90E8]/30">
                  <Image src={selectedImage} alt="Your photo" fill className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">Change Photo</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF90E8]/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#FF90E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[#F5F0E8] font-semibold mb-1">Drop your photo here</p>
                  <p className="text-[#888] text-sm">or click to browse · JPG, PNG up to 10MB</p>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>
          </motion.div>

          {/* Step 2: Style */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
            <h2 className="text-lg font-bold text-[#F5F0E8] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-black text-white">2</span>
              Pick Your Style
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {styles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedStyle === style.id
                      ? 'ring-2 ring-[#FF90E8] scale-[1.02] shadow-lg shadow-[#FF90E8]/20'
                      : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:scale-[1.01]'
                  }`}
                >
                  {style.hot && (
                    <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      🔥 NEW
                    </div>
                  )}
                  <div className="aspect-square relative overflow-hidden bg-[#1A1A1A]">
                    <Image src={style.image} alt={style.name} fill className="object-cover" />
                    {selectedStyle === style.id && (
                      <div className="absolute inset-0 bg-[#FF90E8]/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#FF90E8] flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 bg-[#111]">
                    <h3 className="font-bold text-sm text-[#F5F0E8]">{style.name}</h3>
                    <p className="text-xs text-[#888]">{style.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Step 3: Optional Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
            <h2 className="text-lg font-bold text-[#F5F0E8] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-black text-white">3</span>
              Optional Details
              <span className="text-sm font-normal text-[#888]">(improves accuracy)</span>
            </h2>
            <div className="bg-[#0A0A0A] border-2 border-gray-100 rounded-2xl p-5 space-y-4">
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g.toLowerCase())}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      gender === g.toLowerCase()
                        ? 'bg-[#FF90E8]/20 text-[#FF90E8] border border-[#FF90E8]/30'
                        : 'bg-[#111] text-[#888] border border-[#333] hover:bg-[#0A0A0A]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Job title (e.g. Nurse, Chef, Engineer)"
                className="w-full px-4 py-3 rounded-xl bg-[#111] border border-[#333] text-[#F5F0E8] placeholder:text-[#888] focus:outline-none focus:border-[#FF90E8]/50 transition-colors text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  placeholder="Accessories (e.g. stethoscope)"
                  className="px-4 py-3 rounded-xl bg-[#111] border border-[#333] text-[#F5F0E8] placeholder:text-[#888] focus:outline-none focus:border-[#FF90E8]/50 text-sm"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Scene (e.g. hospital, office)"
                  className="px-4 py-3 rounded-xl bg-[#111] border border-[#333] text-[#F5F0E8] placeholder:text-[#888] focus:outline-none focus:border-[#FF90E8]/50 text-sm"
                />
              </div>
            </div>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-center text-sm">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate */}
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedImage}
              className={`px-12 py-4 text-lg rounded-full font-bold transition-all duration-300 ${
                loading
                  ? 'bg-gray-200 text-[#888] cursor-wait'
                  : selectedImage
                  ? 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 shadow-lg'
                  : 'bg-[#1A1A1A] text-gray-300 cursor-not-allowed border border-[#333]'
              }`}
            >
              {loading ? 'Creating...' : 'Transform Photo ✨'}
            </button>
            {!loading && <p className="text-sm text-[#888] mt-3">Uses 1 credit · ~10 seconds</p>}
          </div>
          </div>
        </div>
      </div>
    </>
  )
}
