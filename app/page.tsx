'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, useInView, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'

/* ─── Colours ─── */
const C = {
  bg: '#0A0A0A',
  bgAlt: '#111111',
  bgCard: '#1A1A1A',
  gold: '#C8A24E',
  goldLight: '#D4B366',
  goldDark: '#A8873A',
  text: '#F5F0E8',
  textSec: '#A0998C',
  textMuted: '#6B6560',
  border: '#2A2A2A',
}

/* ─── Animated Section Wrapper (FIXED) ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Staggered Children ─── */
function StaggerChildren({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Word-by-word Hero Text ─── */
function HeroWords({ text, className = '', goldWords }: { text: string; className?: string; goldWords?: string[] }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const words = text.split(' ')
  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-block mr-[0.3em] ${goldWords?.includes(word) ? 'text-gradient-gold-shimmer' : ''}`}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

/* ─── Count Up Animation ─── */
function CountUp({ target, suffix = '', prefix = '', decimals = 0 }: { target: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2200
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(decimals > 0 ? parseFloat(start.toFixed(decimals)) : Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, decimals])

  return <span ref={ref}>{prefix}{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}</span>
}

/* ─── Cursor Glow (Hero) ─── */
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
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1,
  })), [])

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

/* ─── Interactive Before/After Slider ─── */
function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setSliderPos((x / rect.width) * 100)
  }, [])

  const onMouseDown = useCallback(() => setIsDragging(true), [])
  const onMouseUp = useCallback(() => setIsDragging(false), [])
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) updateSlider(e.clientX)
  }, [isDragging, updateSlider])
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    updateSlider(e.touches[0].clientX)
  }, [updateSlider])

  useEffect(() => {
    const up = () => setIsDragging(false)
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative aspect-square rounded-2xl overflow-hidden cursor-ew-resize select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchStart={onMouseDown}
      onTouchEnd={onMouseUp}
    >
      {/* After (full) */}
      <Image src={after} alt="After" fill className="object-cover" />
      {/* Before (clipped) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <Image src={before} alt="Before" fill className="object-cover" />
      </div>
      {/* Slider line */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M8 15l4 4 4-4" />
          </svg>
        </div>
      </div>
      {/* Labels */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 text-white/80 backdrop-blur-sm">
          Original
        </span>
      </div>
      <div className="absolute top-3 right-3 z-10">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#C8A24E] text-[#0A0A0A]">
          Transformed
        </span>
      </div>
    </div>
  )
}

/* ─── 3D Tilt Card ─── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Style Thumbnail for Hero ─── */
function StyleThumb({ src, label, active, onClick }: { src: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
        active ? 'border-[#C8A24E] ring-2 ring-[#C8A24E]/30 scale-105' : 'border-[#2A2A2A] hover:border-[#6B6560]'
      }`}
    >
      <Image src={src} alt={label} fill className="object-cover" />
      <div className={`absolute inset-0 transition-opacity ${active ? 'bg-[#C8A24E]/10' : 'bg-black/20 hover:bg-black/10'}`} />
      <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate bg-black/60 px-1 py-0.5 rounded text-center">
        {label}
      </span>
    </button>
  )
}

/* ─── Inline Upload Tool (dark premium) ─── */
function UploadTool() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('ghibli')
  const fileRef = useRef<HTMLInputElement>(null)

  const styles = [
    { id: 'ghibli', src: '/examples/ghibli.jpg', label: 'Ghibli' },
    { id: 'cyberpunk-neon', src: '/examples/cyberpunk-neon.jpg', label: 'Cyberpunk' },
    { id: 'renaissance', src: '/examples/renaissance.jpg', label: 'Renaissance' },
    { id: 'oil-painting', src: '/examples/oil-painting.jpg', label: 'Oil Painting' },
    { id: 'anime', src: '/examples/anime.jpg', label: 'Anime' },
    { id: 'pixar', src: '/examples/pixar.jpg', label: 'Pixar 3D' },
    { id: 'gta', src: '/examples/gta.jpg', label: 'GTA V' },
    { id: 'pop-art', src: '/examples/pop-art.jpg', label: 'Pop Art' },
    { id: 'watercolor', src: '/examples/watercolor.jpg', label: 'Watercolor' },
  ]

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      sessionStorage.setItem('mymeme_upload', e.target?.result as string)
      window.location.href = `/create?style=${selectedStyle}`
    }
    reader.readAsDataURL(file)
  }, [selectedStyle])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="glass-card overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#2A2A2A]">
        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        <span className="text-xs text-[#6B6560] ml-2 tracking-wide">Transform your photo</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_140px] gap-0">
        {/* Left: Style picker */}
        <div className="hidden md:block p-3 border-r border-[#2A2A2A] max-h-[340px] overflow-y-auto">
          <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-[0.2em] mb-2 px-1">Styles</p>
          <div className="grid grid-cols-2 gap-1.5">
            {styles.map(s => (
              <StyleThumb key={s.id} src={s.src} label={s.label} active={selectedStyle === s.id} onClick={() => setSelectedStyle(s.id)} />
            ))}
          </div>
        </div>

        {/* Centre: Upload area */}
        <div className="p-6">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-10 text-center min-h-[220px] flex flex-col items-center justify-center ${
              isDragging
                ? 'border-[#C8A24E] bg-[#C8A24E]/5 scale-[1.01]'
                : 'border-[#2A2A2A] hover:border-[#C8A24E]/50 hover:bg-[#1A1A1A]'
            }`}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C8A24E]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#C8A24E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[#F5F0E8] font-semibold mb-1">Drop your photo here</p>
            <p className="text-[#6B6560] text-sm">or click to browse · JPG, PNG up to 10MB</p>
          </div>

          {/* Mobile style chips */}
          <div className="mt-4 flex flex-wrap gap-2 md:hidden">
            {styles.slice(0, 5).map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedStyle === s.id
                    ? 'border-[#C8A24E] bg-[#C8A24E]/10 text-[#C8A24E]'
                    : 'border-[#2A2A2A] text-[#6B6560] hover:text-[#A0998C]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="hidden md:flex flex-col p-3 border-l border-[#2A2A2A]">
          <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-[0.2em] mb-2 px-1">Preview</p>
          <div className="relative flex-1 rounded-xl overflow-hidden min-h-[180px]">
            <Image
              src={styles.find(s => s.id === selectedStyle)?.src || '/examples/ghibli.jpg'}
              alt="Style preview"
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-2 w-full py-2 rounded-lg bg-[#C8A24E] text-[#0A0A0A] text-xs font-bold hover:bg-[#D4B366] transition-colors btn-shimmer"
          >
            Generate · 1 Credit
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Image Carousel ─── */
function StyleCarousel({ images, reverse = false }: { images: { src: string; label: string }[]; reverse?: boolean }) {
  const doubled = [...images, ...images]
  return (
    <div className="overflow-hidden">
      <div className={`flex gap-4 ${reverse ? 'carousel-track-reverse' : 'carousel-track'}`} style={{ width: `${doubled.length * 280}px` }}>
        {doubled.map((img, i) => (
          <Link href="/create" key={i} className="relative w-[260px] h-[260px] flex-shrink-0 rounded-2xl overflow-hidden group perspective-[800px]">
            <Image src={img.src} alt={img.label} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white font-semibold text-sm tracking-wide">{img.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ─── Identity Row (same person, 6 styles) ─── */
function IdentityRow() {
  const styles = [
    { src: '/examples/ghibli.jpg', label: 'Ghibli' },
    { src: '/examples/cyberpunk-neon.jpg', label: 'Cyberpunk' },
    { src: '/examples/oil-painting.jpg', label: 'Oil Painting' },
    { src: '/examples/renaissance.jpg', label: 'Renaissance' },
    { src: '/examples/anime.jpg', label: 'Anime' },
    { src: '/examples/pixar.jpg', label: 'Pixar' },
  ]

  return (
    <StaggerChildren className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {styles.map((s) => (
        <StaggerItem key={s.label}>
          <TiltCard className="group">
            <div className="relative aspect-square rounded-xl overflow-hidden border border-[#2A2A2A] group-hover:border-[#C8A24E]/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#C8A24E]/10">
              <Image src={s.src} alt={s.label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-2 text-[11px] font-bold text-white/90 tracking-wide">{s.label}</span>
            </div>
          </TiltCard>
        </StaggerItem>
      ))}
    </StaggerChildren>
  )
}

/* ─── Feature Section (alternating) ─── */
function FeatureSection({ title, description, image, reverse, badge }: { title: string; description: string; image: string; reverse?: boolean; badge?: string }) {
  return (
    <Reveal>
      <div className={`grid md:grid-cols-2 gap-12 items-center ${reverse ? 'md:direction-rtl' : ''}`}>
        <div className={`${reverse ? 'md:order-2' : ''} space-y-5`}>
          {badge && (
            <span className="inline-block text-xs font-bold text-[#C8A24E] uppercase tracking-[0.25em]">{badge}</span>
          )}
          <h3 className="text-3xl md:text-4xl font-black text-[#F5F0E8] leading-tight tracking-tight">{title}</h3>
          <p className="text-[#A0998C] text-lg leading-relaxed">{description}</p>
          <Link href="/create" className="inline-flex items-center gap-2 text-[#C8A24E] font-bold hover:text-[#D4B366] transition-colors group">
            Try it now
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className={`${reverse ? 'md:order-1' : ''}`}>
          <TiltCard>
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image src={image} alt={title} fill className="object-cover" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            </div>
          </TiltCard>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── Email Capture ─── */
function EmailCapture() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      localStorage.setItem('mymeme_email_capture', email)
      setSubmitted(true)
    }
  }

  return (
    <div className="relative rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#C8A24E] to-[#A8873A]" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(0,0,0,0.3), transparent 60%)' }} />
      <div className="relative">
        {submitted ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-black text-[#0A0A0A] mb-2 tracking-tight">You&apos;re in!</h3>
            <p className="text-[#0A0A0A]/70">Check your inbox for your 3 free credits.</p>
          </motion.div>
        ) : (
          <>
            <h3 className="text-3xl md:text-4xl font-black text-[#0A0A0A] mb-3 tracking-tight">Get 3 Free Credits</h3>
            <p className="text-[#0A0A0A]/70 mb-8">Sign up and instantly receive 3 free credits to transform any photo.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-[#0A0A0A]/10 border-2 border-[#0A0A0A]/20 text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 focus:outline-none focus:border-[#0A0A0A]/40 transition-colors"
              />
              <button type="submit" className="px-6 py-3 rounded-xl bg-[#0A0A0A] text-[#C8A24E] font-bold hover:bg-[#1A1A1A] transition-colors whitespace-nowrap">
                Claim Free Credits →
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── FAQ ─── */
function FAQItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-[#2A2A2A]">
      <button onClick={onClick} className="w-full text-left py-5 flex items-center justify-between group">
        <span className={`text-lg font-semibold transition-colors ${open ? 'text-[#C8A24E]' : 'text-[#F5F0E8] group-hover:text-[#A0998C]'}`}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#6B6560] text-2xl flex-shrink-0 ml-4"
        >+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[#A0998C] leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════ */
/* ─── MAIN PAGE ─── */
/* ═══════════════════════════════════════ */

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const carouselRow1 = [
    { src: '/examples/ghibli.jpg', label: 'Studio Ghibli' },
    { src: '/examples/cyberpunk-neon.jpg', label: 'Cyberpunk Neon' },
    { src: '/examples/renaissance.jpg', label: 'Renaissance' },
    { src: '/examples/oil-painting.jpg', label: 'Oil Painting' },
    { src: '/examples/anime.jpg', label: 'Anime' },
    { src: '/examples/pixar.jpg', label: 'Pixar 3D' },
  ]
  const carouselRow2 = [
    { src: '/examples/italian-brainrot.jpg', label: 'Italian Brainrot' },
    { src: '/examples/gta.jpg', label: 'GTA V' },
    { src: '/examples/pop-art.jpg', label: 'Pop Art' },
    { src: '/examples/watercolor.jpg', label: 'Watercolor' },
    { src: '/examples/caricature.jpg', label: 'Caricature' },
    { src: '/examples/superhero.jpg', label: 'Superhero' },
  ]

  const reviews = [
    { name: 'Sarah M.', text: 'The Ghibli style is absolutely magical. My friends thought I commissioned an artist!', rating: 5, avatar: '👩‍🎨' },
    { name: 'James T.', text: 'Italian Brainrot had me crying laughing. Best £1.49 I ever spent. Shared it everywhere.', rating: 5, avatar: '🎮' },
    { name: 'Priya K.', text: 'Used the oil painting style for our anniversary. It\'s now framed in our living room.', rating: 5, avatar: '👰' },
    { name: 'Marcus D.', text: 'I run a social media page. The cyberpunk style gets insane engagement. Professional quality.', rating: 5, avatar: '📱' },
    { name: 'Emma L.', text: 'Made my nan\'s old photos into beautiful watercolour prints. She cried happy tears.', rating: 5, avatar: '🎨' },
    { name: 'Alex R.', text: 'The Pixar style made my kid\'s day. He thinks he\'s a real cartoon character now!', rating: 5, avatar: '🧒' },
  ]

  const faqs = [
    { q: 'How does MyMeme work?', a: 'Upload any photo, choose from 15+ AI art styles, and get a stunning transformation in under 10 seconds. Our AI preserves your facial features while applying the artistic style.' },
    { q: 'What styles are available?', a: 'We offer Ghibli, Cyberpunk Neon, Renaissance, Oil Painting, Italian Brainrot, Anime, Pixar, GTA V, Caricature, Pop Art, Watercolor, Superhero, Comic Book, Pencil Sketch, Sticker, Retro 80s, and more.' },
    { q: 'Is it free to try?', a: 'Yes! You get 3 free generations when you sign up. No credit card required. After that, credits start from just £0.49.' },
    { q: 'Can I use the images commercially?', a: 'Yes! All generated images are yours to use however you like — social media, prints, gifts, content creation.' },
    { q: 'Is my photo safe?', a: 'Absolutely. Your photos are processed securely, never stored permanently, and never shared with third parties. We take privacy seriously.' },
    { q: 'How good is the quality?', a: 'We use state-of-the-art AI models that produce HD 1024×1024 images. The quality rivals professional digital art.' },
    { q: 'What file formats are supported?', a: 'Upload JPG, PNG, or WebP images up to 10MB. Results are delivered as high-quality JPGs.' },
  ]

  const features = [
    {
      badge: 'Style Transfer',
      title: '15+ Artistic Styles at Your Fingertips',
      description: 'From Studio Ghibli to Renaissance masterworks, from Cyberpunk Neon to Italian Brainrot — every style is crafted to produce gallery-worthy results.',
      image: '/examples/ghibli.jpg',
    },
    {
      badge: 'Face Preservation',
      title: 'Your Face. Perfectly Preserved.',
      description: 'Our AI doesn\'t just slap a filter on. It understands facial structure, expressions, and features — then rebuilds them in the chosen artistic style.',
      image: '/examples/pixar.jpg',
      reverse: true,
    },
    {
      badge: 'Lightning Fast',
      title: 'Results in Under 10 Seconds',
      description: 'No waiting around. Upload, pick a style, and watch the magic happen in real time. High-resolution 1024×1024 output, every time.',
      image: '/examples/cyberpunk-neon.jpg',
    },
    {
      badge: 'Versatile',
      title: 'Selfies, Pets, Group Shots — Anything Goes',
      description: 'Portraits, pet photos, family shots, landscapes — our AI handles them all. If it\'s a photo, we can transform it.',
      image: '/examples/anime.jpg',
      reverse: true,
    },
  ]

  return (
    <div className="bg-[#0A0A0A] text-[#F5F0E8] overflow-hidden grain-overlay">
      <CursorGlow />

      {/* ═══ 1. HERO — Identity-first ═══ */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#C8A24E]/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,162,78,0.08),transparent_60%)]" />
        <Particles />

        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full">
          {/* Headline */}
          <div className="text-center mb-12">
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-[#C8A24E]/10 text-[#C8A24E] px-4 py-2 rounded-full text-sm font-bold mb-8 border border-[#C8A24E]/20 backdrop-blur-sm">
                <span className="w-2 h-2 bg-[#C8A24E] rounded-full animate-pulse" />
                Over 127,000 photos transformed
              </div>
            </Reveal>
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight">
                <HeroWords text="Turn your photo into art" />
                <br />
                <span className="text-gradient-gold-shimmer">
                  <HeroWords text="— and still look like you." />
                </span>
              </h1>
            </div>
            <Reveal delay={600}>
              <p className="text-lg md:text-xl text-[#A0998C] max-w-2xl mb-8 leading-relaxed mx-auto tracking-wide">
                15+ AI art styles that transform your photo into stunning artwork while perfectly preserving your identity.
              </p>
            </Reveal>
          </div>

          {/* Embedded Upload Tool */}
          <Reveal delay={800}>
            <div className="max-w-4xl mx-auto">
              <UploadTool />
            </div>
          </Reveal>

          <Reveal delay={1000}>
            <p className="text-center text-[#6B6560] text-sm mt-6 tracking-wide">3 free credits · No sign-up required</p>
          </Reveal>
        </div>
      </section>

      {/* ═══ 2. IDENTITY PROOF — Before/After + Style Row ═══ */}
      <section id="examples" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold text-[#C8A24E] uppercase tracking-[0.3em] mb-4">Identity Preserved</span>
              <h2 className="text-4xl md:text-5xl font-black text-[#F5F0E8] mb-4 tracking-tight">Same You. Different Worlds.</h2>
              <p className="text-[#A0998C] text-lg max-w-2xl mx-auto">Drag the slider to see the transformation. Every style keeps your unique features intact.</p>
            </div>
          </Reveal>

          {/* Interactive Before/After Slider */}
          <Reveal delay={200}>
            <div className="max-w-lg mx-auto mb-16">
              <BeforeAfterSlider before="/examples/before.png" after="/examples/ghibli.jpg" />
            </div>
          </Reveal>

          {/* Same person, 6 styles row */}
          <Reveal>
            <p className="text-center text-sm text-[#6B6560] mb-6 uppercase tracking-[0.25em] font-bold">One photo. Six styles. Still you.</p>
          </Reveal>
          <IdentityRow />

          <Reveal delay={200} className="text-center mt-12">
            <Link href="/create" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-black bg-[#C8A24E] text-[#0A0A0A] hover:bg-[#D4B366] transition-all duration-300 shadow-lg shadow-[#C8A24E]/20 btn-shimmer">
              Transform Your Photo →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ 3. SOCIAL PROOF STATS ═══ */}
      <section className="py-16 border-y border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto px-4">
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { target: 127000, suffix: '+', label: 'Photos Transformed' },
              { target: 15, suffix: '+', label: 'Art Styles' },
              { target: 4.9, suffix: ' ★', label: 'User Rating', decimals: 1 },
              { target: 10, suffix: 's', label: 'Per Transform', prefix: '<' },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <p className="text-3xl md:text-4xl font-black text-[#C8A24E]">
                  <CountUp target={stat.target} suffix={stat.suffix} prefix={stat.prefix} decimals={stat.decimals} />
                </p>
                <p className="text-sm text-[#6B6560] mt-1 tracking-wide">{stat.label}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ 4. STYLE CAROUSEL ═══ */}
      <section className="py-20 md:py-28 bg-[#111111]/50">
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <Reveal>
            <div className="text-center">
              <span className="inline-block text-xs font-bold text-[#C8A24E] uppercase tracking-[0.3em] mb-4">🔥 Trending</span>
              <h2 className="text-4xl md:text-5xl font-black text-[#F5F0E8] mb-4 tracking-tight">Explore Every Style</h2>
              <p className="text-[#A0998C] text-lg max-w-xl mx-auto">From Studio Ghibli to Cyberpunk — find the perfect artistic transformation.</p>
            </div>
          </Reveal>
        </div>
        <div className="space-y-4">
          <StyleCarousel images={carouselRow1} />
          <StyleCarousel images={carouselRow2} reverse />
        </div>
      </section>

      {/* ═══ 5. HOW IT WORKS ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold text-[#C8A24E] uppercase tracking-[0.3em] mb-4">How It Works</span>
              <h2 className="text-4xl md:text-5xl font-black text-[#F5F0E8] mb-4 tracking-tight">Three Steps. Ten Seconds.</h2>
            </div>
          </Reveal>
          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📸', title: 'Upload', desc: 'Drop any photo — selfie, portrait, pet, anything.' },
              { step: '02', icon: '🎨', title: 'Choose Style', desc: 'Pick from 15+ unique AI art styles.' },
              { step: '03', icon: '⚡', title: 'Download', desc: 'Get your HD artwork in under 10 seconds.' },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <TiltCard>
                  <div className="glass-card p-8 text-center hover:border-[#C8A24E]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#C8A24E]/5">
                    <motion.div
                      className="text-5xl mb-4"
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {item.icon}
                    </motion.div>
                    <div className="text-xs font-bold text-[#C8A24E] mb-2 tracking-[0.25em]">STEP {item.step}</div>
                    <h3 className="text-xl font-black text-[#F5F0E8] mb-2 tracking-tight">{item.title}</h3>
                    <p className="text-[#A0998C]">{item.desc}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ 6. FEATURES (alternating) ═══ */}
      <section className="py-20 md:py-28 border-t border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto px-4 space-y-24 md:space-y-32">
          {features.map((feat, i) => (
            <FeatureSection key={i} {...feat} />
          ))}
        </div>
      </section>

      {/* ═══ 7. REVIEWS ═══ */}
      <section className="py-20 md:py-28 bg-[#111111]/50">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-[#F5F0E8] mb-4 tracking-tight">Loved by Thousands</h2>
              <div className="flex items-center justify-center gap-1 text-[#C8A24E] text-2xl mb-2">★★★★★</div>
              <p className="text-[#6B6560]">4.9 out of 5 from 1,200+ reviews</p>
            </div>
          </Reveal>
          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <StaggerItem key={review.name}>
                <TiltCard>
                  <div className="glass-card p-6 hover:border-[#C8A24E]/20 transition-all duration-300 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{review.avatar}</span>
                      <div>
                        <p className="font-bold text-[#F5F0E8]">{review.name}</p>
                        <div className="text-[#C8A24E] text-sm">★★★★★</div>
                      </div>
                    </div>
                    <p className="text-[#A0998C] leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ 8. PRICING ═══ */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold text-[#C8A24E] uppercase tracking-[0.3em] mb-4">Pricing</span>
              <h2 className="text-4xl md:text-5xl font-black text-[#F5F0E8] mb-4 tracking-tight">Simple, Honest Pricing</h2>
              <p className="text-[#A0998C] text-lg">Start free. No credit card required.</p>
            </div>
          </Reveal>
          <StaggerChildren className="grid md:grid-cols-4 gap-5 max-w-5xl mx-auto items-start">
            {[
              { name: 'Try One', price: '£0.49', period: '/ 1 credit', features: ['1 HD generation', 'All styles', 'No watermark'], cta: 'Try It', href: '/pricing', highlight: false },
              { name: 'Creator Pack', price: '£1.49', period: '/ 5 credits', features: ['5 HD generations', 'All 15+ styles', 'No watermark', 'Priority speed'], cta: 'Get Started →', href: '/pricing', highlight: true, badge: 'MOST POPULAR' },
              { name: 'Pro Pack', price: '£4.99', period: '/ 25 credits', features: ['25 HD generations', 'All styles', 'No watermark', 'Priority speed', 'Bulk discount'], cta: 'Best Value', href: '/pricing', highlight: false, badge: 'BEST VALUE' },
              { name: 'Unlimited', price: '£19.99', period: '/ year', features: ['Unlimited everything', 'Exclusive styles', 'Early access', 'Priority support'], cta: 'Go Unlimited', href: '/pricing', highlight: false },
            ].map((plan) => (
              <StaggerItem key={plan.name}>
                <div className={`rounded-3xl p-7 relative transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-[#D4B366] to-[#A8873A] text-[#0A0A0A] scale-105 shadow-2xl shadow-[#C8A24E]/25 ring-1 ring-[#E8D5A0]/30'
                    : 'glass-card hover:border-[#C8A24E]/30'
                }`}>
                  {plan.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap ${
                      plan.highlight
                        ? 'bg-[#0A0A0A] text-[#C8A24E] border border-[#C8A24E]'
                        : 'bg-[#C8A24E] text-[#0A0A0A]'
                    }`}>
                      {plan.badge}
                    </div>
                  )}
                  <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-[#0A0A0A]' : 'text-[#F5F0E8]'}`}>{plan.name}</h3>
                  <div className="mb-5">
                    <span className={`text-3xl font-black ${plan.highlight ? 'text-[#0A0A0A]' : 'text-[#F5F0E8]'}`}>{plan.price}</span>
                    {plan.period && <span className={`text-sm ml-1 ${plan.highlight ? 'text-[#0A0A0A]/60' : 'text-[#6B6560]'}`}>{plan.period}</span>}
                  </div>
                  <ul className="space-y-2.5 mb-7 text-sm">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-center gap-2 ${plan.highlight ? 'text-[#0A0A0A]/80' : 'text-[#A0998C]'}`}>
                        <span className={plan.highlight ? 'text-[#0A0A0A]' : 'text-[#C8A24E]'}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block text-center py-3 rounded-full font-bold transition-all duration-300 ${
                      plan.highlight
                        ? 'bg-[#0A0A0A] text-[#C8A24E] hover:bg-[#1A1A1A] btn-shimmer'
                        : 'border border-[#2A2A2A] text-[#F5F0E8] hover:border-[#C8A24E] hover:text-[#C8A24E]'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══ EMAIL CAPTURE ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <EmailCapture />
          </Reveal>
        </div>
      </section>

      {/* ═══ 9. FAQ ═══ */}
      <section id="faq" className="py-20 md:py-28 bg-[#111111]/50">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-[#F5F0E8] mb-4 tracking-tight">Frequently Asked Questions</h2>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div>
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} open={faqOpen === i} onClick={() => setFaqOpen(faqOpen === i ? null : i)} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 10. FINAL CTA ═══ */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#C8A24E]/8 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(200,162,78,0.06),transparent_60%)]" />
        <Particles />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-black text-[#F5F0E8] mb-6 leading-tight tracking-tight">
              Ready to See Yourself
              <br />
              <span className="text-gradient-gold-shimmer">Like Never Before?</span>
            </h2>
            <p className="text-[#6B6560] text-lg mb-10 tracking-wide">
              Join 127,000+ people who&apos;ve already discovered their artistic alter ego.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-full text-xl font-black bg-gradient-to-r from-[#C8A24E] to-[#D4B366] text-[#0A0A0A] hover:from-[#D4B366] hover:to-[#E8D5A0] transition-all duration-300 shadow-lg shadow-[#C8A24E]/25 btn-shimmer"
              >
                Start Creating — It&apos;s Free ✨
              </Link>
            </motion.div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
