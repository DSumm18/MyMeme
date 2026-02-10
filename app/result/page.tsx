'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import GeneratedResult from '../components/GeneratedResult'

function ResultContent() {
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
    <GeneratedResult 
      imageUrl={imageUrl} 
      onCreateAnother={handleCreateAnother}
    />
  )
}

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-purple-50 py-16 flex items-center justify-center">
      <Suspense fallback={<div className="text-white text-xl">Loading...</div>}>
        <ResultContent />
      </Suspense>
    </div>
  )
}
