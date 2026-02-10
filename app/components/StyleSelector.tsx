'use client'

import { useState } from 'react'
import Image from 'next/image'

const styles = [
  { 
    id: 'caricature', 
    name: 'Caricature', 
    image: '/style-caricature.jpg',
    description: 'Classic, fun cartoon style'
  },
  { 
    id: 'watercolor', 
    name: 'Watercolor', 
    image: '/style-watercolor.jpg',
    description: 'Soft, artistic watercolor'
  },
  { 
    id: 'anime', 
    name: 'Anime', 
    image: '/style-anime.jpg',
    description: 'Japanese animation style'
  },
  { 
    id: 'popArt', 
    name: 'Pop Art', 
    image: '/style-pop-art.jpg',
    description: 'Bold, colorful comic style'
  }
]

export default function StyleSelector({ 
  onStyleSelect 
}: { 
  onStyleSelect: (style: string) => void 
}) {
  const [selectedStyle, setSelectedStyle] = useState('caricature')

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId)
    onStyleSelect(styleId)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-purple-600">
        Choose Your Art Style
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {styles.map((style) => (
          <div 
            key={style.id}
            onClick={() => handleStyleSelect(style.id)}
            className={`
              p-4 rounded-lg cursor-pointer transition-all duration-300 
              ${selectedStyle === style.id 
                ? 'bg-purple-600 text-white border-4 border-secondary scale-105' 
                : 'bg-purple-50 hover:bg-purple-600/10'}
            `}
          >
            <Image 
              src={style.image} 
              alt={`${style.name} Style`} 
              width={200} 
              height={200} 
              className="rounded-lg mb-4 aspect-square object-cover"
            />
            <div className="text-center">
              <h4 className="font-semibold">{style.name}</h4>
              <p className="text-sm opacity-70">
                {style.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}