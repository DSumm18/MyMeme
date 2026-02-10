'use client'

import { useState } from 'react'
import Image from 'next/image'

const socialFormats = [
  { 
    id: 'fb-profile', 
    name: 'FB Profile', 
    dimensions: '170x170',
    emoji: '👤'
  },
  { 
    id: 'fb-cover', 
    name: 'FB Cover', 
    dimensions: '820x312',
    emoji: '🖼️'
  },
  { 
    id: 'ig-square', 
    name: 'IG Square', 
    dimensions: '1080x1080',
    emoji: '📸'
  },
  { 
    id: 'ig-story', 
    name: 'IG Story', 
    dimensions: '1080x1920',
    emoji: '📱'
  },
  { 
    id: 'whatsapp', 
    name: 'WhatsApp', 
    dimensions: '500x500',
    emoji: '💬'
  },
  { 
    id: 'desktop', 
    name: 'Desktop', 
    dimensions: '1920x1080',
    emoji: '💻'
  }
]

export default function GeneratedResult({ 
  imageUrl,
  onCreateAnother 
}: { 
  imageUrl: string,
  onCreateAnother: () => void 
}) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  const handleCopyLink = async (format: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'mymeme-caricature.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-purple-50 rounded-lg shadow-lg">
      <div className="mb-8 text-center">
        <Image 
          src={imageUrl} 
          alt="Generated Caricature" 
          width={600} 
          height={600} 
          className="rounded-lg mx-auto max-w-full shadow-xl"
        />
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-purple-600 mb-4">
            Share Your Caricature
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {socialFormats.map((format) => (
              <button 
                key={format.id}
                onClick={() => handleCopyLink(format.id)}
                className={`
                  flex flex-col items-center p-4 rounded-lg transition-all duration-300
                  ${copiedFormat === format.id 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white hover:bg-purple-600/10'}
                `}
              >
                <span className="text-3xl mb-2">{format.emoji}</span>
                <span className="text-sm font-semibold">{format.name}</span>
                <span className="text-xs text-gray-500">{format.dimensions}</span>
                {copiedFormat === format.id && (
                  <span className="text-xs mt-2">Copied!</span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={handleDownload}
            className="bg-purple-600 text-white hover:bg-pink-500 transform hover:scale-105 transition-all duration-300 flex-1 py-3 rounded-full"
          >
            Download Image
          </button>
          <button 
            onClick={onCreateAnother}
            className="bg-purple-50 border border-purple-600 text-purple-600 flex-1 py-3 rounded-full hover:bg-purple-600/10"
          >
            Create Another
          </button>
        </div>
        
        <div className="text-center">
          <button 
            className="text-gray-500 hover:text-purple-600 transition opacity-50 hover:opacity-100 text-sm"
            disabled
          >
            Make it a Meme (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  )
}