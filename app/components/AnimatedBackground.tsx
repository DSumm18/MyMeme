'use client'

import { useState, useEffect } from 'react'

/* ─── Cursor Glow ─── */
function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    const leave = () => setVisible(false)
    window.addEventListener('mousemove', handler)
    window.addEventListener('mouseleave', leave)
    return () => { window.removeEventListener('mousemove', handler); window.removeEventListener('mouseleave', leave) }
  }, [])

  if (!visible) return null
  return (
    <div
      className="pointer-events-none fixed z-0 w-[600px] h-[600px] rounded-full transition-opacity duration-500"
      style={{
        left: pos.x - 300,
        top: pos.y - 300,
        background: 'radial-gradient(circle, rgba(200,162,78,0.06) 0%, transparent 70%)',
        opacity: visible ? 1 : 0,
      }}
    />
  )
}

/* ─── Floating Particles ─── */
function Particles() {
  const [particles, setParticles] = useState<Array<{id:number,left:string,size:number,duration:number,delay:number,opacity:number}>>([])
  
  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
    })))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '-5px',
            width: p.size,
            height: p.size,
            backgroundColor: `rgba(200, 162, 78, ${p.opacity})`,
            animation: `particle-float ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Main Animated Background ─── */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#0A0A0A]" />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#C8A24E]/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,162,78,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(200,162,78,0.04),transparent_50%)]" />
      {/* Particles */}
      <Particles />
      {/* Cursor glow needs pointer events */}
      <div className="pointer-events-auto">
        <CursorGlow />
      </div>
    </div>
  )
}
