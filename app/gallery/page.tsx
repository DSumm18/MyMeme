'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface Creation {
  id: string
  original_image_url: string
  generated_image_url: string
  style: string
  prompt?: string
  job_title?: string
  cost: number
  created_at: string
}

export default function GalleryPage() {
  const { user } = useAuth()
  const [creations, setCreations] = useState<Creation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<Creation | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    async function fetchCreations() {
      try {
        const { data, error } = await supabase
          .from('creations')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setCreations(data || [])
      } catch (error) {
        console.error('Error fetching creations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCreations()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5E1] via-[#FFE8F0] to-[#E8F5E9] flex items-center justify-center p-4 pt-24 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md">
          <h1 className="text-3xl md:text-4xl font-black mb-6" style={{ color: '#1A1A2E' }}>
            🖼️ My Gallery
          </h1>
          <p className="text-gray-600 mb-8">
            Sign in to see your magical transformations and saved creations.
          </p>
          <button 
            onClick={() => {}} // This will trigger the sign-in method from useAuth
            className="bg-[#FF6B9D] text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-[#FF3D7A] transition-colors"
          >
            Sign In 🔐
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5E1] via-[#FFE8F0] to-[#E8F5E9] flex items-center justify-center p-4 pt-24">
        <div className="animate-pulse text-2xl text-[#FF6B9D]">
          Loading your magical gallery... ✨
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E1] via-[#FFE8F0] to-[#E8F5E9] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black" style={{ color: '#1A1A2E' }}>
            🖼️ My Gallery
          </h1>
          <Link 
            href="/create" 
            className="bg-[#FF6B9D] text-white px-6 py-3 rounded-full hover:bg-[#FF3D7A] transition-colors"
          >
            Create New 🎨
          </Link>
        </div>

        {creations.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center">
            <p className="text-xl text-gray-600 mb-6">
              Your gallery is empty. Let&apos;s create some magic! 🪄
            </p>
            <Link 
              href="/create" 
              className="bg-[#FF6B9D] text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-[#FF3D7A] transition-colors"
            >
              Make Your First Meme 🚀
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {creations.map((creation) => (
              <div 
                key={creation.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedImage(creation)}
              >
                <div className="relative aspect-square">
                  <Image 
                    src={creation.generated_image_url} 
                    alt={`${creation.style} style meme`} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform" 
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-sm font-bold px-2 py-1 rounded-full" 
                      style={{ 
                        backgroundColor: creation.style === 'anime' ? '#9E7BFF' 
                          : creation.style === 'pixar' ? '#00D8FF'
                          : creation.style === 'superhero' ? '#FF3D7A'
                          : '#FF6B9D', 
                        color: 'white' 
                      }}
                    >
                      {creation.style}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(creation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {creation.job_title && (
                    <p className="mt-2 text-sm text-gray-700 truncate">{creation.job_title}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-3xl z-10 bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center"
            >
              ✖️
            </button>
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-square">
                <Image 
                  src={selectedImage.original_image_url} 
                  alt="Original photo" 
                  fill 
                  className="object-contain" 
                />
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  Original
                </div>
              </div>
              <div className="relative aspect-square">
                <Image 
                  src={selectedImage.generated_image_url} 
                  alt={`${selectedImage.style} style meme`} 
                  fill 
                  className="object-contain" 
                />
                <div 
                  className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm text-white"
                  style={{ 
                    backgroundColor: selectedImage.style === 'anime' ? '#9E7BFF' 
                      : selectedImage.style === 'pixar' ? '#00D8FF'
                      : selectedImage.style === 'superhero' ? '#FF3D7A'
                      : '#FF6B9D'
                  }}
                >
                  {selectedImage.style}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              {selectedImage.job_title && (
                <p className="text-xl font-bold mb-2" style={{ color: '#1A1A2E' }}>
                  {selectedImage.job_title}
                </p>
              )}
              {selectedImage.prompt && (
                <p className="text-gray-600 italic">{selectedImage.prompt}</p>
              )}
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>Created on {new Date(selectedImage.created_at).toLocaleString()}</span>
                <span>Cost: £{selectedImage.cost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}