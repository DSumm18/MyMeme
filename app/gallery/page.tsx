'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'
import Link from 'next/link'

interface Creation {
  id: number
  original_image_url: string
  generated_image_url: string
  style: string
  prompt: string
  job_title: string
  gender: string
  cost: number
  created_at: string
}

export default function GalleryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [creations, setCreations] = useState<Creation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If not authenticated, redirect to home
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    // Fetch user's creations
    const fetchCreations = async () => {
      if (!user) return

      setLoading(true)
      const { data, error } = await supabase
        .from('creations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching creations:', error)
      } else {
        setCreations(data || [])
      }
      setLoading(false)
    }

    fetchCreations()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-primary-pink animate-pulse">Loading your gallery...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary-pink">My Gallery 🖼️</h1>
      
      {creations.length === 0 ? (
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-6">No creations yet! Create your first meme →</p>
          <Link 
            href="/create" 
            className="bg-primary-pink text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Create a Meme
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {creations.map((creation) => (
            <div 
              key={creation.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-square">
                <Image 
                  src={creation.generated_image_url} 
                  alt={`Meme with ${creation.job_title}`} 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 bg-bright-yellow px-2 py-1 rounded-full">
                    {creation.style} Style
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(creation.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800 line-clamp-2">
                  {creation.job_title} • {creation.gender}
                </p>
                <button 
                  className="w-full mt-3 bg-primary-pink text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                  // Placeholder for future album functionality
                  onClick={() => alert('Album feature coming soon!')}
                >
                  Add to Album
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}