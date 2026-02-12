'use client'

import { useState } from 'react'
import Image from 'next/image'

const styles = [
  { 
    id: 'caricature', 
    name: 'Caricature', 
    image: '/styles/caricature.png',
    description: 'Big head, big personality!'
  },
  { 
    id: 'watercolor', 
    name: 'Watercolor', 
    image: '/styles/watercolor.png',
    description: 'Soft artistic portrait!'
  },
  { 
    id: 'anime', 
    name: 'Anime', 
    image: '/styles/anime.png',
    description: 'Kawaii cartoon style!'
  },
  { 
    id: 'pop-art', 
    name: 'Pop Art', 
    image: '/styles/pop-art.png',
    description: 'Bold comic book vibes!'
  },
  { 
    id: 'clay-3d', 
    name: 'Claymation', 
    image: '/styles/clay-3d.png',
    description: 'Sculpted clay figure look!'
  },
  { 
    id: 'superhero', 
    name: 'Superhero', 
    image: '/styles/superhero.png',
    description: 'Comic book hero pose!'
  },
  { 
    id: 'renaissance', 
    name: 'Oil Painting', 
    image: '/styles/renaissance.png',
    description: 'Classic masterpiece style!'
  },
  { 
    id: 'pencil-sketch', 
    name: 'Pencil Sketch', 
    image: '/styles/pencil-sketch.png',
    description: 'Hand-drawn artistry!'
  },
  { 
    id: 'pixar', 
    name: 'Pixar', 
    image: '/styles/pixar.png',
    description: 'Animated character magic!'
  },
  { 
    id: 'retro-80s', 
    name: 'Retro 80s', 
    image: '/styles/retro-80s.png',
    description: 'Synthwave nostalgia!'
  },
  { 
    id: 'comic-book', 
    name: 'Comic Book', 
    image: '/styles/comic-book.png',
    description: 'Superhero comic style!'
  },
  { 
    id: 'sticker', 
    name: 'Sticker', 
    image: '/styles/sticker.png',
    description: 'Die-cut cool vibes!'
  },
  { 
    id: 'lego', 
    name: 'Lego', 
    image: '/styles/lego.png',
    description: 'Blocky toy character!'
  },
  { 
    id: 'gta', 
    name: 'GTA Style', 
    image: '/styles/gta.png',
    description: 'Video game loading screen!'
  },
  { 
    id: 'simpsons', 
    name: 'Simpsons', 
    image: '/styles/simpsons.png',
    description: 'Yellow cartoon character!'
  },
  { 
    id: 'minecraft', 
    name: 'Minecraft', 
    image: '/styles/minecraft.png',
    description: 'Pixelated block world!'
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
      <h3 className="text-2xl font-bold text-center text-purple-600">
        Choose Your Art Style
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {styles.map((style) => (
          <div 
            key={style.id}
            onClick={() => handleStyleSelect(style.id)}
            className={`
              p-2 rounded-xl cursor-pointer transition-all duration-300 
              ${selectedStyle === style.id 
                ? 'ring-4 ring-[#FF6B9D] scale-105 shadow-xl' 
                : 'hover:bg-purple-50 hover:scale-105'}
            `}
          >
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image 
                src={style.image} 
                alt={`${style.name} Style`} 
                fill
                className="object-cover transform transition-all duration-300"
              />
            </div>
            <div className="text-center mt-2">
              <h4 className="font-bold text-sm">{style.name}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {style.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}