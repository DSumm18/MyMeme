'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

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
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center ${
        isDragging
          ? 'border-[#FF90E8] bg-[#FF90E8]/10 scale-[1.02]'
          : 'border-gray-300 hover:border-[#FF90E8] hover:bg-[#FFF0FB]'
      }`}
    >
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {preview ? (
        <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden">
          <Image src={preview} alt="Preview" fill className="object-cover" />
        </div>
      ) : (
        <>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF90E8]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#FF90E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-900 font-semibold mb-1">Drop your photo here</p>
          <p className="text-gray-400 text-sm">or click to browse · JPG, PNG up to 10MB</p>
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

/* ─── Before/After Pair (side by side) ─── */
function BeforeAfterPair({ before, after, label }: { before: string; after: string; label: string }) {
  return (
    <div className="group">
      <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
        <div className="relative aspect-square">
          <Image src={before} alt="Original photo" fill className="object-cover" />
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white/90 text-gray-600">
              Before
            </span>
          </div>
        </div>
        <div className="relative aspect-square">
          <Image src={after} alt={`${label} style`} fill className="object-cover" />
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[#FF90E8] text-white">
              After
            </span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center font-bold text-gray-900 text-sm">{label}</p>
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
      localStorage.setItem('mymeme_email_capture', email)
      setSubmitted(true)
    }
  }

  return (
    <div className="bg-[#FF90E8] rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto">
      {submitted ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">You&apos;re in!</h3>
          <p className="text-gray-800/70">Check your inbox for your 3 free credits.</p>
        </motion.div>
      ) : (
        <>
          <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Get 3 Free Credits</h3>
          <p className="text-gray-800/70 mb-8">Sign up and instantly receive 3 free credits to transform any photo.</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-gray-900/10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900/30 transition-colors"
            />
            <button type="submit" className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors whitespace-nowrap">
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
    <div className="border-b border-gray-200">
      <button onClick={onClick} className="w-full text-left py-5 flex items-center justify-between group">
        <span className={`text-lg font-semibold transition-colors ${open ? 'text-[#FF90E8]' : 'text-gray-900 group-hover:text-gray-600'}`}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-gray-400 text-2xl flex-shrink-0 ml-4">+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-5 text-gray-500 leading-relaxed">{a}</p>
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
    { before: '/examples/before.png', after: '/examples/ghibli.jpg', label: 'Studio Ghibli' },
    { before: '/examples/before.png', after: '/examples/cyberpunk-neon.jpg', label: 'Cyberpunk Neon' },
    { before: '/examples/before.png', after: '/examples/oil-painting.jpg', label: 'Oil Painting' },
    { before: '/examples/before.png', after: '/examples/renaissance.jpg', label: 'Renaissance' },
    { before: '/examples/before.png', after: '/examples/pop-art.jpg', label: 'Pop Art' },
    { before: '/examples/before.png', after: '/examples/anime.jpg', label: 'Anime' },
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
    <div className="bg-white text-gray-900 overflow-hidden">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12">
        <div className="relative max-w-6xl mx-auto px-4 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              <Reveal>
                <div className="inline-flex items-center gap-2 bg-[#FF90E8]/10 text-[#FF90E8] px-4 py-2 rounded-full text-sm font-bold mb-8">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Over 127,000 photos transformed
                </div>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-6 tracking-tight text-gray-900">
                  Your Photo.
                  <br />
                  <span className="text-[#FF90E8]">Any Style.</span>
                  <br />
                  Instantly.
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-lg text-gray-500 max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0">
                  Upload a photo. Choose from 15+ AI art styles — Ghibli, Cyberpunk, Renaissance and more. Get a stunning transformation in seconds.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-4">
                  <Link
                    href="/create"
                    className="px-8 py-4 rounded-full text-lg font-black bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300 shadow-lg"
                  >
                    Start Creating — Free ✨
                  </Link>
                  <a href="#examples" className="px-6 py-4 rounded-full text-lg text-gray-500 hover:text-gray-900 border-2 border-gray-200 hover:border-gray-900 transition-all">
                    See Examples ↓
                  </a>
                </div>
                <p className="text-gray-400 text-sm">3 free credits · No sign-up required</p>
              </Reveal>
            </div>

            {/* Right: Upload Tool */}
            <Reveal delay={400}>
              <div className="bg-gray-50 rounded-3xl p-6 border-2 border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-400 ml-2">Transform your photo</span>
                </div>
                <UploadTool />
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Ghibli', 'Cyberpunk', 'Renaissance', 'Oil Painting', 'Anime'].map(s => (
                    <Link
                      key={s}
                      href={`/create?style=${s.toLowerCase().replace(' ', '-')}`}
                      className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-[#FF90E8] transition-all"
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
      <section className="py-16 border-y-2 border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { target: 127000, suffix: '+', label: 'Photos Transformed' },
              { target: 15, suffix: '+', label: 'Art Styles' },
              { target: 4, suffix: '.9 ★', label: 'User Rating' },
              { target: 10, suffix: 's', label: 'Per Transform', prefix: '<' },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <p className="text-3xl md:text-4xl font-black text-gray-900"><CountUp target={stat.target} suffix={stat.suffix} prefix={stat.prefix} /></p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BEFORE/AFTER SHOWCASE ═══ */}
      <section id="examples" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Same Photo. Different Worlds.</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">Every transformation starts from the same original photo. See the AI magic side by side.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {beforeAfters.map((ex, i) => (
              <Reveal key={i} delay={i * 80}>
                <BeforeAfterPair {...ex} />
              </Reveal>
            ))}
          </div>
          <Reveal delay={500} className="text-center mt-12">
            <Link href="/create" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-black bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg">
              Transform Your Photo →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ STYLE CAROUSEL ═══ */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <Reveal>
            <div className="text-center">
              <span className="inline-block bg-[#FF90E8]/10 text-[#FF90E8] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                🔥 Trending Styles
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Explore Every Style</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">From Studio Ghibli to Cyberpunk — find the perfect artistic transformation.</p>
            </div>
          </Reveal>
        </div>
        <div className="space-y-4">
          <StyleCarousel images={carouselRow1} />
          <StyleCarousel images={carouselRow2} reverse />
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Three Steps. Ten Seconds.</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📸', title: 'Upload', desc: 'Drop any photo — selfie, portrait, pet, anything.', bg: 'bg-[#FFF0FB]' },
              { step: '02', icon: '🎨', title: 'Choose Style', desc: 'Pick from 15+ unique AI art styles.', bg: 'bg-[#F0F7FF]' },
              { step: '03', icon: '⚡', title: 'Download', desc: 'Get your HD artwork in under 10 seconds.', bg: 'bg-[#F0FFF4]' },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 150}>
                <div className={`${item.bg} rounded-3xl p-8 text-center border-2 border-gray-100 hover:border-gray-200 transition-colors`}>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="text-xs font-bold text-gray-400 mb-2 tracking-widest">STEP {item.step}</div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Loved by Thousands</h2>
              <div className="flex items-center justify-center gap-1 text-yellow-500 text-2xl mb-2">★★★★★</div>
              <p className="text-gray-400">4.9 out of 5 from 1,200+ reviews</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <Reveal key={review.name} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{review.avatar}</span>
                    <div>
                      <p className="font-bold text-gray-900">{review.name}</p>
                      <div className="text-yellow-500 text-sm">★★★★★</div>
                    </div>
                  </div>
                  <p className="text-gray-500 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
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
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">More Ways to Create</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🎬', title: 'Photo Animation', desc: 'Bring old photos to life. Watch loved ones smile and move again with AI-powered animation.', href: '/animate', bg: 'bg-[#FFF0FB]' },
              { icon: '📸', title: 'Cinematic Albums', desc: 'Turn your photo collection into a professional video with music, transitions, and cinematic flair.', href: '/album', bg: 'bg-[#F0F7FF]' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 150}>
                <div className={`${item.bg} rounded-3xl p-8 border-2 border-gray-100 hover:border-gray-200 transition-colors`}>
                  <span className="text-4xl mb-4 block">{item.icon}</span>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 mb-6">{item.desc}</p>
                  <Link href={item.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all">
                    Try It →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Simple Pricing</h2>
              <p className="text-gray-500 text-lg">Start free. No credit card required.</p>
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
                    ? 'bg-gray-900 text-white scale-105 shadow-2xl'
                    : 'bg-white border-2 border-gray-100'
                }`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF90E8] text-white text-xs font-bold px-4 py-1 rounded-full">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <div className="mb-6">
                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    {plan.period && <span className={`text-sm ml-1 ${plan.highlight ? 'text-gray-400' : 'text-gray-400'}`}>{plan.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8 text-sm">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-center gap-2 ${plan.highlight ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className="text-[#FF90E8]">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block text-center py-3 rounded-full font-bold transition-all ${
                      plan.highlight
                        ? 'bg-white text-gray-900 hover:bg-gray-100'
                        : 'border-2 border-gray-200 text-gray-900 hover:border-gray-900'
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
      <section id="faq" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
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
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Ready to See Yourself
              <br />
              <span className="text-[#FF90E8]">Like Never Before?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Join 127,000+ people who&apos;ve already discovered their artistic alter ego.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full text-xl font-black bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300 shadow-lg"
            >
              Start Creating — It&apos;s Free ✨
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
