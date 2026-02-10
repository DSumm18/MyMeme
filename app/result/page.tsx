'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import GeneratedResult from '../components/GeneratedResult'

export default function ResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = searchParams.get('imageUrl')
    if (!url) {
      router.push('/create')
    } else {
      setImageUrl(decodeURIComponent(url))
    }
  }, [searchParams, router])

  const handleCreateAnother = () => {
    router.push('/create')
  }

  if (!imageUrl) return null

  return (
    <div className="min-h-screen bg-background py-16 flex items-center justify-center">
      <GeneratedResult 
        imageUrl={imageUrl} 
        onCreateAnother={handleCreateAnother}
      />
    </div>
  )
}