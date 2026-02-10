'use client'

import { useState, useEffect } from 'react'

const funMessages = [
  'Sketching your epic cartoon self...',
  'Adding some serious artistic magic...',
  'Turning you into a cartoon superhero...',
  'Unleashing the caricature wizard...',
  'Creating your meme-worthy portrait...'
]

export default function LoadingOverlay({ isLoading }: { isLoading: boolean }) {
  const [currentMessage, setCurrentMessage] = useState(funMessages[0])

  useEffect(() => {
    if (isLoading) {
      const messageInterval = setInterval(() => {
        const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)]
        setCurrentMessage(randomMessage)
      }, 2500)

      return () => clearInterval(messageInterval)
    }
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-primary/80 z-50 flex flex-col items-center justify-center">
      <div className="animate-pulse text-6xl mb-8">
        🎨
      </div>
      <div className="spinner w-16 h-16 border-4 border-t-4 border-white rounded-full animate-spin mb-8" />
      <p className="text-white text-xl text-center animate-fadeIn">
        {currentMessage}
      </p>
    </div>
  )
}