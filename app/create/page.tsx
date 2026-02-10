'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const router = useRouter()
  const [selectedStyle, setSelectedStyle] = useState('caricature')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [occupation, setOccupation] = useState('')
  const [accessories, setAccessories] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState('person')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const styles = [
    { id: 'caricature', name: 'Caricature', image: '/style-caricature.jpg', description: 'Big head, big personality!' },
    { id: 'teacher', name: 'Classroom', image: '/style-teacher.jpg', description: 'Chalkboard cartoon vibes!' },
    { id: 'anime', name: 'Anime', image: '/style-anime.jpg', description: 'Kawaii office style!' },
    { id: 'watercolor', name: 'Watercolor', image: '/style-watercolor.jpg', description: 'Soft artistic portrait!' },
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image too large. Max 10MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => setSelectedImage(reader.result as string)
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleGenerate = async () => {
    if (!selectedImage || !jobTitle) {
      setError('Please upload a selfie and enter your job title!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          jobTitle,
          gender,
          style: selectedStyle,
          occupation,
          accessories,
          location,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      // Store result in sessionStorage and navigate
      sessionStorage.setItem('mymeme_result', JSON.stringify({
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        cost: data.cost,
        style: selectedStyle,
        jobTitle,
      }))
      router.push('/result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FFF5E1] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-2" style={{ color: '#1A1A2E' }}>
          Create Your Meme 🎨
        </h1>
        <p className="text-center text-gray-500 mb-12">Three simple steps. Takes 10 seconds.</p>

        {/* Step 1: Upload */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
            <span className="bg-[#FF6B9D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">1</span>
            Upload Your Selfie
          </h2>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#FF6B9D] rounded-2xl p-8 text-center cursor-pointer hover:bg-[#FF6B9D]/5 transition-colors"
          >
            {selectedImage ? (
              <div className="relative w-48 h-48 mx-auto">
                <Image src={selectedImage} alt="Your selfie" fill className="rounded-xl object-cover" />
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-3">📸</div>
                <p className="text-gray-500">Click to upload or drag & drop</p>
                <p className="text-sm text-gray-400 mt-1">JPG, PNG — max 10MB</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
        </div>

        {/* Step 2: Your Details */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
            <span className="bg-[#FFD93D] text-[#1A1A2E] w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">2</span>
            Tell Us About You
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Job Title *</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Nurse, Teacher, Chef, Software Engineer"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B9D] transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Gender (optional)</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B9D]"
                >
                  <option value="person">Any</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Accessories (optional)</label>
                <input
                  type="text"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  placeholder="e.g. stethoscope, coffee mug"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B9D]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Location / Scene (optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. hospital ward, busy kitchen, office desk"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B9D]"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Style */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
            <span className="bg-[#6BCB77] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">3</span>
            Pick Your Style
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {styles.map((style) => (
              <div
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  selectedStyle === style.id
                    ? 'ring-4 ring-[#FF6B9D] scale-105 shadow-lg'
                    : 'hover:shadow-md hover:scale-102'
                }`}
              >
                <div className="relative aspect-square">
                  <Image src={style.image} alt={style.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <div className="p-3 bg-white">
                  <h3 className="font-bold text-sm">{style.name}</h3>
                  <p className="text-xs text-gray-500">{style.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedImage || !jobTitle}
            className={`px-12 py-4 text-xl rounded-full font-black transition-all duration-300 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-wait'
                : selectedImage && jobTitle
                ? 'bg-[#FF6B9D] text-white hover:scale-105 hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Creating Your Meme...
              </span>
            ) : (
              'Create My Meme 🎨'
            )}
          </button>
          {!loading && <p className="text-sm text-gray-400 mt-3">Free • No account needed • 10 seconds</p>}
        </div>
      </div>
    </div>
  )
}
