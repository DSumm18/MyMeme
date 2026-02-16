'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'

/* ─── Animated Section Wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay / 1000, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Count Up Animation ─── */
function CountUp({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as any, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

/* ─── Inline Upload Tool ─── */
function UploadTool() {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      // Store and redirect
      sessionStorage.setItem('mymeme_upload', e.target?.result as string)
      window.location.href = '/create'
    }
    reader.readAsDataURL(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`upload-zone relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center ${
        isDragging
          ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
          : 'border-white/20 hover:border-purple-400/50 hover:bg-white/[0.02]'
      }`}
    >
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {preview ? (
        <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden">
          <Image src={preview} alt="Preview" fill className="object-cover" />
        </div>
      ) : (
        <>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-white/80 font-medium mb-1">Drop your photo here</p>
          <p className="text-white/40 text-sm">or click to browse · JPG, PNG up to 10MB</p>
        </>
      )}
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
          <Link href="/create" key={i} className="relative w-[260px] h-[260px] flex-shrink-0 rounded-2xl overflow-hidden group">
            <Image src={img.src} alt={img.label} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white font-semibold text-sm">{img.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ─── Before/After Card ─── */
function BeforeAfterCard({ before, after, label }: { before: string; after: string; label: string }) {
  const [showAfter, setShowAfter] = useState(false)
  useEffect(() => {
    const iv = setInterval(() => setShowAfter(p => !p), 2800)
    return () => clearInterval(iv)
  }, [])

  return (
    <div
      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group hover-glow"
      onClick={() => setShowAfter(p => !p)}
    >
      <Image src={before} alt="Before" fill className={`object-cover transition-opacity duration-700 ${showAfter ? 'opacity-0' : 'opacity-100'}`} />
      <Image src={after} alt="After" fill className={`object-cover transition-opacity duration-700 ${showAfter ? 'opacity-100' : 'opacity-0'}`} />
      <div className="absolute top-3 left-3">
        <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm transition-colors ${showAfter ? 'bg-purple-500/90 text-white' : 'bg-white/20 text-white'}`}>
          {showAfter ? 'After ✨' : 'Before'}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-white font-semibold text-sm">{label}</p>
      </div>
    </div>
  )
}

/* ─── Email Capture ─── */
function EmailCapture() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Store for later
      localStorage.setItem('mymeme_email_capture', email)
      setSubmitted(true)
    }
  }

  return (
    <div className="glass-card p-8 md:p-12 text-center max-w-2xl mx-auto">
      {submitted ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">You&apos;re in!</h3>
          <p className="text-white/60">Check your inbox for your 3 free credits.</p>
        </motion.div>
      ) : (
        <>
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🎁 Limited Offer
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white mb-3">Get 3 Free Credits</h3>
          <p className="text-white/50 mb-8">Sign up and instantly receive 3 free credits to transform any photo.</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity whitespace-nowrap">
              Claim Free Credits →
            </button>
          </form>
        </>
      )}
    </div>
  )
}

/* ─── FAQ ─── */
function FAQItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-white/[0.06]">
      <button onClick={onClick} className="w-full text-left py-5 flex items-center justify-between group">
        <span className={`text-lg font-medium transition-colors ${open ? 'text-purple-400' : 'text-white/80 group-hover:text-white'}`}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-white/40 text-2xl flex-shrink-0 ml-4">+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-5 text-white/50 leading-relaxed">{a}</p>
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

  const beforeAfters = [
    { before: '/styles/before.png', after: '/examples/ghibli.jpg', label: 'Studio Ghibli' },
    { before: '/styles/before.png', after: '/examples/cyberpunk-neon.jpg', label: 'Cyberpunk Neon' },
    { before: '/styles/before.png', after: '/examples/oil-painting.jpg', label: 'Oil Painting' },
    { before: '/styles/before.png', after: '/examples/renaissance.jpg', label: 'Renaissance' },
    { before: '/styles/before.png', after: '/examples/anime.jpg', label: 'Anime' },
    { before: '/styles/before.png', after: '/examples/italian-brainrot.jpg', label: 'Italian Brainrot' },
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
    { q: 'Is it free to try?', a: 'Yes! You get 3 free generations when you sign up. No credit card required. After that, credits start from just £1.49.' },
    { q: 'Can I use the images commercially?', a: 'Yes! All generated images are yours to use however you like — social media, prints, gifts, content creation.' },
    { q: 'Is my photo safe?', a: 'Absolutely. Your photos are processed securely, never stored permanently, and never shared with third parties. We take privacy seriously.' },
    { q: 'How good is the quality?', a: 'We use state-of-the-art AI models that produce HD 1024×1024 images. The quality rivals professional digital art.' },
    { q: 'What file formats are supported?', a: 'Upload JPG, PNG, or WebP images up to 10MB. Results are delivered as high-quality JPGs.' },
  ]

  return (
    <div className="overflow-hidden">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 pb-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[130px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] animate-float-slow" />
        </div>

        {/* Floating style previews */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-32 left-[8%] w-24 h-24 rounded-xl overflow-hidden opacity-40 rotate-[-8deg]">
            <Image src="/examples/ghibli.jpg" alt="" fill className="object-cover" />
          </motion.div>
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} className="absolute top-48 right-[10%] w-28 h-28 rounded-xl overflow-hidden opacity-30 rotate-[6deg]">
            <Image src="/examples/cyberpunk-neon.jpg" alt="" fill className="object-cover" />
          </motion.div>
          <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 2 }} className="absolute bottom-40 left-[12%] w-20 h-20 rounded-xl overflow-hidden opacity-35 rotate-[12deg]">
            <Image src="/examples/renaissance.jpg" alt="" fill className="object-cover" />
          </motion.div>
          <motion.div animate={{ y: [0, -22, 0] }} transition={{ duration: 8, repeat: Infinity, delay: 0.5 }} className="absolute bottom-32 right-[8%] w-24 h-24 rounded-xl overflow-hidden opacity-25 rotate-[-5deg]">
            <Image src="/examples/oil-painting.jpg" alt="" fill className="object-cover" />
          </motion.div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              <Reveal>
                <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm border border-white/10 text-white/70 px-4 py-2 rounded-full text-sm mb-8">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Over 127,000 photos transformed
                </div>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-6 tracking-tight">
                  <span className="text-white">Your Photo.</span>
                  <br />
                  <span className="text-gradient">Any Style.</span>
                  <br />
                  <span className="text-white">Instantly.</span>
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-lg text-white/50 max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0">
                  Upload a photo. Choose from 15+ AI art styles — Ghibli, Cyberpunk, Renaissance and more. Get a stunning transformation in seconds.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-4">
                  <Link
                    href="/create"
                    className="px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/25"
                  >
                    Start Creating — Free ✨
                  </Link>
                  <a href="#examples" className="px-6 py-4 rounded-full text-lg text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                    See Examples ↓
                  </a>
                </div>
                <p className="text-white/30 text-sm">3 free credits · No sign-up required</p>
              </Reveal>
            </div>

            {/* Right: Upload Tool */}
            <Reveal delay={400}>
              <div className="glass-card p-6 glow-purple">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  <span className="text-xs text-white/30 ml-2">Transform your photo</span>
                </div>
                <UploadTool />
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Ghibli', 'Cyberpunk', 'Renaissance', 'Oil Painting', 'Anime'].map(s => (
                    <Link
                      key={s}
                      href={`/create?style=${s.toLowerCase().replace(' ', '-')}`}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-purple-500/30 transition-all"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF STATS ═══ */}
      <section className="py-16 border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { target: 127000, suffix: '+', label: 'Photos Transformed' },
              { target: 15, suffix: '+', label: 'Art Styles' },
              { target: 4, suffix: '.9 ★', label: 'User Rating' },
              { target: 10, suffix: 's', label: 'Per Transform', prefix: '<' },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <p className="text-3xl md:text-4xl font-black text-white"><CountUp target={stat.target} suffix={stat.suffix} prefix={stat.prefix} /></p>
                <p className="text-sm text-white/40 mt-1">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STYLE CAROUSEL ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <Reveal>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                🔥 Trending Styles
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Explore Every Style</h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto">From Studio Ghibli to Cyberpunk — find the perfect artistic transformation.</p>
            </div>
          </Reveal>
        </div>
        <div className="space-y-4">
          <StyleCarousel images={carouselRow1} />
          <StyleCarousel images={carouselRow2} reverse />
        </div>
      </section>

      {/* ═══ BEFORE/AFTER ═══ */}
      <section id="examples" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">See the Transformation</h2>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">Same photo, completely different vibes. Tap any image to toggle before/after.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {beforeAfters.map((ex, i) => (
              <Reveal key={i} delay={i * 80}>
                <BeforeAfterCard {...ex} />
              </Reveal>
            ))}
          </div>
          <Reveal delay={500} className="text-center mt-12">
            <Link href="/create" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 hover:scale-105 transition-all shadow-lg shadow-purple-500/25">
              Transform Your Photo →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Three Steps. Ten Seconds.</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📸', title: 'Upload', desc: 'Drop any photo — selfie, portrait, pet, anything.', color: 'from-purple-500/20 to-purple-600/5' },
              { step: '02', icon: '🎨', title: 'Choose Style', desc: 'Pick from 15+ unique AI art styles.', color: 'from-pink-500/20 to-pink-600/5' },
              { step: '03', icon: '⚡', title: 'Download', desc: 'Get your HD artwork in under 10 seconds.', color: 'from-blue-500/20 to-blue-600/5' },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 150}>
                <div className={`glass-card p-8 text-center bg-gradient-to-b ${item.color} hover-glow`}>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="text-xs font-bold text-white/30 mb-2 tracking-widest">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/50">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Loved by Thousands</h2>
              <div className="flex items-center justify-center gap-1 text-yellow-400 text-2xl mb-2">★★★★★</div>
              <p className="text-white/40">4.9 out of 5 from 1,200+ reviews</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <Reveal key={review.name} delay={i * 100}>
                <div className="glass-card p-6 hover-glow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{review.avatar}</span>
                    <div>
                      <p className="font-bold text-white">{review.name}</p>
                      <div className="text-yellow-400 text-sm">★★★★★</div>
                    </div>
                  </div>
                  <p className="text-white/50 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MORE PRODUCTS ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">More Ways to Create</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🎬', title: 'Photo Animation', desc: 'Bring old photos to life. Watch loved ones smile and move again with AI-powered animation.', href: '/animate', color: 'from-purple-600/20' },
              { icon: '📸', title: 'Cinematic Albums', desc: 'Turn your photo collection into a professional video with music, transitions, and cinematic flair.', href: '/album', color: 'from-pink-600/20' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 150}>
                <div className={`glass-card p-8 bg-gradient-to-br ${item.color} to-transparent hover-glow`}>
                  <span className="text-4xl mb-4 block">{item.icon}</span>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/50 mb-6">{item.desc}</p>
                  <Link href={item.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
                    Try It →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Simple Pricing</h2>
              <p className="text-white/40 text-lg">Start free. No credit card required.</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Free', price: '£0', period: '', features: ['3 generations', 'All styles', 'Watermarked'], cta: 'Get Started', href: '/create', highlight: false },
              { name: 'Creator Pack', price: '£1.49', period: '/ 50 credits', features: ['50 HD generations', 'All 15+ styles', 'No watermark', 'Priority speed'], cta: 'Get Credits →', href: '/pricing', highlight: true, badge: 'MOST POPULAR' },
              { name: 'Pro Unlimited', price: '£19.99', period: '/ year', features: ['Unlimited everything', 'Exclusive styles', 'Early access', 'Priority support'], cta: 'Go Pro', href: '/pricing', highlight: false },
            ].map((plan, i) => (
              <Reveal key={plan.name} delay={i * 150}>
                <div className={`rounded-3xl p-8 relative ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-purple-600/30 to-purple-900/20 border border-purple-500/30 scale-105 glow-purple'
                    : 'glass-card'
                }`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    {plan.period && <span className="text-sm text-white/40 ml-1">{plan.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8 text-sm">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-white/60">
                        <span className="text-purple-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block text-center py-3 rounded-full font-semibold transition-all ${
                      plan.highlight
                        ? 'bg-white text-[#0a0a0f] hover:bg-gray-100'
                        : 'border border-white/20 text-white hover:bg-white/5'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
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

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Frequently Asked Questions</h2>
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

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Ready to See Yourself
              <br />
              <span className="text-gradient">Like Never Before?</span>
            </h2>
            <p className="text-white/40 text-lg mb-10">
              Join 127,000+ people who&apos;ve already discovered their artistic alter ego.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              Start Creating — It&apos;s Free ✨
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
